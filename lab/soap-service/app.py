#!/usr/bin/env python3
import base64
import hashlib
import os
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from lxml import etree
from signxml import XMLVerifier
from signxml.exceptions import InvalidSignature

TNS = "http://api-schulung.local/orders/v1"
SOAP11_NS = "http://schemas.xmlsoap.org/soap/envelope/"
SOAP12_NS = "http://www.w3.org/2003/05/soap-envelope"
WSSE_NS = "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
WSU_NS = "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"
DS_NS = "http://www.w3.org/2000/09/xmldsig#"
PASS_DIGEST_TYPE = (
    "http://docs.oasis-open.org/wss/2004/01/"
    "oasis-200401-wss-username-token-profile-1.0#PasswordDigest"
)

WSDL_PATH = Path(__file__).parent / "order-service.wsdl"
WSDL_BYTES = WSDL_PATH.read_bytes()
WSDL_DOC = etree.fromstring(WSDL_BYTES)
XSD_NODE = WSDL_DOC.find(".//{http://www.w3.org/2001/XMLSchema}schema")
ORDER_SCHEMA = etree.XMLSchema(XSD_NODE)

WSS_USER = os.environ.get("SOAP_WSS_USER", "lab-wss-user")
WSS_PASS = os.environ.get("SOAP_WSS_PASS", "CHANGE_ME_LAB_WSS_PASS")
CERT_DIR = Path(os.environ.get("LAB_CERT_DIR", "/certs"))

ORDERS_DB = {
    "ORD-1000": {
        "orderId": "ORD-1000",
        "customerId": "CUST-42",
        "itemCode": "API-BOOK-01",
        "quantity": "2",
        "totalAmount": "99.80",
        "status": "CONFIRMED",
    }
}


def make_soap_fault(is_soap12: bool, code: str, reason: str, detail: str = "") -> bytes:
    ns = SOAP12_NS if is_soap12 else SOAP11_NS
    env = etree.Element(f"{{{ns}}}Envelope", nsmap={"soap": ns})
    body = etree.SubElement(env, f"{{{ns}}}Body")
    fault = etree.SubElement(body, f"{{{ns}}}Fault")
    if is_soap12:
        code_el = etree.SubElement(fault, f"{{{ns}}}Code")
        val_el = etree.SubElement(code_el, f"{{{ns}}}Value")
        mapped = "soap:Sender" if code in ("Client", "Sender", "wsse:FailedCheck", "wsse:FailedAuthentication") else "soap:Receiver"
        val_el.text = mapped
        if code.startswith("wsse:"):
            sub = etree.SubElement(code_el, f"{{{ns}}}Subcode")
            sub_val = etree.SubElement(sub, f"{{{ns}}}Value")
            sub_val.text = code
        reason_el = etree.SubElement(fault, f"{{{ns}}}Reason")
        txt = etree.SubElement(reason_el, f"{{{ns}}}Text", attrib={"{http://www.w3.org/XML/1998/namespace}lang": "de"})
        txt.text = reason
        if detail:
            det = etree.SubElement(fault, f"{{{ns}}}Detail")
            det.text = detail
    else:
        fc = etree.SubElement(fault, "faultcode")
        fc.text = code if ":" in code else f"soap:{code}"
        fs = etree.SubElement(fault, "faultstring")
        fs.text = reason
        if detail:
            det = etree.SubElement(fault, "detail")
            det.text = detail
    return etree.tostring(env, xml_declaration=True, encoding="UTF-8", pretty_print=True)


def make_soap_response(is_soap12: bool, payload_el: etree._Element) -> bytes:
    ns = SOAP12_NS if is_soap12 else SOAP11_NS
    env = etree.Element(f"{{{ns}}}Envelope", nsmap={"soap": ns, "tns": TNS})
    body = etree.SubElement(env, f"{{{ns}}}Body")
    body.append(payload_el)
    return etree.tostring(env, xml_declaration=True, encoding="UTF-8", pretty_print=True)


def parse_iso_utc(value: str) -> datetime:
    cleaned = value.strip()
    if cleaned.endswith("Z"):
        cleaned = cleaned[:-1] + "+00:00"
    dt = datetime.fromisoformat(cleaned)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def verify_ws_security(env: etree._Element, soap_ns: str, require_signature: bool) -> tuple[str, bool]:
    header = env.find(f"{{{soap_ns}}}Header")
    if header is None:
        raise PermissionError("Fehlender <soap:Header> mit <wsse:Security>.")

    sec = header.find(f"{{{WSSE_NS}}}Security")
    if sec is None:
        raise PermissionError("Fehlender <wsse:Security>-Header.")

    # 1. Timestamp pruefen
    ts = sec.find(f"{{{WSU_NS}}}Timestamp")
    if ts is None:
        raise PermissionError("Fehlender <wsu:Timestamp> im WS-Security-Header.")
    created_el = ts.find(f"{{{WSU_NS}}}Created")
    expires_el = ts.find(f"{{{WSU_NS}}}Expires")
    if created_el is None or not created_el.text or expires_el is None or not expires_el.text:
        raise PermissionError("<wsu:Timestamp> muss Created und Expires enthalten.")
    now = datetime.now(timezone.utc)
    created_dt = parse_iso_utc(created_el.text)
    expires_dt = parse_iso_utc(expires_el.text)
    if created_dt > now + timedelta(seconds=60):
        raise PermissionError("Timestamp Created liegt in der Zukunft (Clock Skew).")
    if expires_dt < now - timedelta(seconds=5):
        raise PermissionError("WS-Security Timestamp ist abgelaufen (TTL ueberschritten).")

    # 2. UsernameToken pruefen (PasswordText oder PasswordDigest)
    ut = sec.find(f"{{{WSSE_NS}}}UsernameToken")
    if ut is None:
        raise PermissionError("Fehlender <wsse:UsernameToken> im WS-Security-Header.")
    user_el = ut.find(f"{{{WSSE_NS}}}Username")
    pass_el = ut.find(f"{{{WSSE_NS}}}Password")
    if user_el is None or user_el.text != WSS_USER:
        raise PermissionError("Ungueltiger WS-Security Benutzername.")
    if pass_el is None or pass_el.text is None:
        raise PermissionError("Fehlendes <wsse:Password>-Element.")

    pass_type = pass_el.attrib.get("Type", "")
    if pass_type == PASS_DIGEST_TYPE:
        nonce_el = ut.find(f"{{{WSSE_NS}}}Nonce")
        ut_created_el = ut.find(f"{{{WSU_NS}}}Created")
        if nonce_el is None or not nonce_el.text or ut_created_el is None or not ut_created_el.text:
            raise PermissionError("PasswordDigest erfordert <wsse:Nonce> und <wsu:Created>.")
        try:
            raw_nonce = base64.b64decode(nonce_el.text.strip())
        except Exception as exc:
            raise PermissionError(f"Ungueltige Base64-Nonce: {exc}") from exc
        digest_input = raw_nonce + ut_created_el.text.strip().encode("utf-8") + WSS_PASS.encode("utf-8")
        expected_digest = base64.b64encode(hashlib.sha1(digest_input).digest()).decode("ascii")
        if pass_el.text.strip() != expected_digest:
            raise PermissionError("WS-Security PasswordDigest stimmt nicht ueberein.")
    else:
        if pass_el.text != WSS_PASS:
            raise PermissionError("WS-Security Passwort stimmt nicht ueberein.")

    # 3. Optionale oder zwingende XML-Signatur pruefen
    sig_el = sec.find(f"{{{DS_NS}}}Signature")
    sig_verified = False
    if sig_el is not None or require_signature:
        if sig_el is None:
            raise PermissionError("Operation erfordert eine XML-Signatur (<ds:Signature>).")
        client_cert_path = CERT_DIR / "client.crt"
        ca_cert_path = CERT_DIR / "ca.crt"
        if not client_cert_path.exists() and not ca_cert_path.exists():
            raise RuntimeError("Kein Zertifikat unter /certs/client.crt oder /certs/ca.crt verfuegbar.")

        # Kopie fuer Verifikation: wsu:Id fuer XMLVerifier als Id-Attribut nutzbar machen
        verify_doc = etree.fromstring(etree.tostring(env))
        for el in verify_doc.iter():
            wsu_id = el.attrib.get(f"{{{WSU_NS}}}Id")
            if wsu_id and "Id" not in el.attrib:
                el.attrib["Id"] = wsu_id
        try:
            kwargs = {"id_attribute": "Id"}
            if client_cert_path.exists():
                kwargs["x509_cert"] = client_cert_path.read_text(encoding="utf-8")
            elif ca_cert_path.exists():
                kwargs["ca_pem_file"] = str(ca_cert_path)
            XMLVerifier().verify(verify_doc, **kwargs)
            sig_verified = True
        except InvalidSignature as exc:
            raise ValueError(f"XML-Signaturpruefung fehlgeschlagen: {exc}") from exc
        except Exception as exc:
            raise ValueError(f"WS-Security Signaturfehler: {exc}") from exc

    return user_el.text, sig_verified


def handle_operation(op_el: etree._Element, verified_user: str | None, sig_verified: bool, is_secure_endpoint: bool) -> etree._Element:
    local_name = etree.QName(op_el).localname

    if local_name == "CreateOrderRequest":
        customer_id = op_el.findtext(f"{{{TNS}}}customerId", "").strip()
        item_code = op_el.findtext(f"{{{TNS}}}itemCode", "").strip()
        qty = int(op_el.findtext(f"{{{TNS}}}quantity", "1"))
        net = Decimal(op_el.findtext(f"{{{TNS}}}netAmount", "0"))
        total = (net * Decimal(qty)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        order_id = f"ORD-{uuid.uuid4().hex[:6].upper()}"
        ORDERS_DB[order_id] = {
            "orderId": order_id,
            "customerId": customer_id,
            "itemCode": item_code,
            "quantity": str(qty),
            "totalAmount": str(total),
            "status": "CREATED",
        }
        resp = etree.Element(f"{{{TNS}}}CreateOrderResponse")
        etree.SubElement(resp, f"{{{TNS}}}orderId").text = order_id
        etree.SubElement(resp, f"{{{TNS}}}status").text = "CREATED"
        etree.SubElement(resp, f"{{{TNS}}}totalAmount").text = str(total)
        return resp

    if local_name == "GetOrderRequest":
        order_id = op_el.findtext(f"{{{TNS}}}orderId", "").strip()
        if order_id not in ORDERS_DB:
            raise LookupError(f"Auftrag '{order_id}' wurde nicht gefunden.")
        data = ORDERS_DB[order_id]
        resp = etree.Element(f"{{{TNS}}}GetOrderResponse")
        for key in ("orderId", "customerId", "itemCode", "quantity", "totalAmount", "status"):
            etree.SubElement(resp, f"{{{TNS}}}{key}").text = data[key]
        return resp

    if local_name == "CalculateTaxRequest":
        net = Decimal(op_el.findtext(f"{{{TNS}}}netAmount", "0"))
        country = op_el.findtext(f"{{{TNS}}}countryCode", "CH").strip().upper()
        rates = {"CH": Decimal("0.081"), "DE": Decimal("0.190"), "AT": Decimal("0.200")}
        rate = rates.get(country, Decimal("0.100"))
        tax = (net * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        gross = (net + tax).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        resp = etree.Element(f"{{{TNS}}}CalculateTaxResponse")
        etree.SubElement(resp, f"{{{TNS}}}taxRate").text = str(rate)
        etree.SubElement(resp, f"{{{TNS}}}taxAmount").text = str(tax)
        etree.SubElement(resp, f"{{{TNS}}}grossAmount").text = str(gross)
        return resp

    if local_name == "CreateSecureOrderRequest":
        if not is_secure_endpoint or not verified_user:
            raise PermissionError("CreateSecureOrder erfordert /soap/secure mit gueltigem WS-Security-Header.")
        order_id = op_el.findtext(f"{{{TNS}}}orderId", "").strip()
        resp = etree.Element(f"{{{TNS}}}CreateSecureOrderResponse")
        etree.SubElement(resp, f"{{{TNS}}}orderId").text = order_id
        etree.SubElement(resp, f"{{{TNS}}}billingStatus").text = "BILLED_SECURE"
        etree.SubElement(resp, f"{{{TNS}}}verifiedUser").text = verified_user
        etree.SubElement(resp, f"{{{TNS}}}signatureVerified").text = "true" if sig_verified else "false"
        return resp

    raise KeyError(f"Unbekannte Operation: {local_name}")


class SoapHandler(BaseHTTPRequestHandler):
    def _send(self, status: int, content_type: str, body: bytes) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self._send(200, "application/json", b'{"status":"ok","service":"soap-service"}')
            return
        if parsed.path in ("/wsdl", "/soap") and ("wsdl" in parsed.query.lower() or parsed.path == "/wsdl"):
            self._send(200, "text/xml; charset=utf-8", WSDL_BYTES)
            return
        self._send(404, "text/plain; charset=utf-8", b"Not Found. Use GET /soap?wsdl or POST /soap")

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path not in ("/soap", "/soap/secure"):
            self._send(404, "text/plain; charset=utf-8", b"Unknown SOAP endpoint")
            return

        is_secure = parsed.path == "/soap/secure"
        query = parse_qs(parsed.query)
        require_sig = query.get("requireSignature", ["false"])[0].lower() == "true"

        content_type = self.headers.get("Content-Type", "").lower()
        is_soap12 = "application/soap+xml" in content_type
        resp_ct = "application/soap+xml; charset=utf-8" if is_soap12 else "text/xml; charset=utf-8"

        length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(length)

        try:
            env = etree.fromstring(raw_body)
        except etree.XMLSyntaxError as exc:
            self._send(500, resp_ct, make_soap_fault(is_soap12, "Client", f"Ungueltiges XML: {exc}"))
            return

        expected_soap_ns = SOAP12_NS if is_soap12 else SOAP11_NS
        if not env.tag.startswith(f"{{{expected_soap_ns}}}"):
            self._send(
                500,
                resp_ct,
                make_soap_fault(
                    is_soap12,
                    "Client",
                    "Content-Type passt nicht zum SOAP-Envelope-Namespace (SOAP 1.1 text/xml vs. SOAP 1.2 application/soap+xml).",
                ),
            )
            return

        if not is_soap12 and "SOAPAction" not in self.headers:
            self._send(500, resp_ct, make_soap_fault(False, "Client", "SOAP 1.1 erfordert den HTTP-Header SOAPAction."))
            return

        body_el = env.find(f"{{{expected_soap_ns}}}Body")
        if body_el is None or len(body_el) == 0:
            self._send(500, resp_ct, make_soap_fault(is_soap12, "Client", "Leerer oder fehlender <soap:Body>."))
            return

        op_el = body_el[0]

        # XSD-Validierung des Body-Payloads
        try:
            ORDER_SCHEMA.assertValid(op_el)
        except etree.DocumentInvalid as exc:
            self._send(500, resp_ct, make_soap_fault(is_soap12, "Client", f"XSD-Validierungsfehler: {exc}"))
            return

        verified_user = None
        sig_verified = False
        if is_secure:
            try:
                require_sig = require_sig or etree.QName(op_el).localname == "CreateSecureOrderRequest"
                verified_user, sig_verified = verify_ws_security(env, expected_soap_ns, require_sig)
            except PermissionError as exc:
                self._send(500, resp_ct, make_soap_fault(is_soap12, "wsse:FailedAuthentication", str(exc)))
                return
            except ValueError as exc:
                self._send(500, resp_ct, make_soap_fault(is_soap12, "wsse:FailedCheck", str(exc)))
                return
            except Exception as exc:
                self._send(500, resp_ct, make_soap_fault(is_soap12, "Server", str(exc)))
                return

        try:
            result_el = handle_operation(op_el, verified_user, sig_verified, is_secure)
            self._send(200, resp_ct, make_soap_response(is_soap12, result_el))
        except LookupError as exc:
            self._send(500, resp_ct, make_soap_fault(is_soap12, "Client", str(exc)))
        except PermissionError as exc:
            self._send(500, resp_ct, make_soap_fault(is_soap12, "wsse:FailedAuthentication", str(exc)))
        except KeyError as exc:
            self._send(500, resp_ct, make_soap_fault(is_soap12, "Client", str(exc)))
        except Exception as exc:
            self._send(500, resp_ct, make_soap_fault(is_soap12, "Server", f"Interner Serverfehler: {exc}"))

    def log_message(self, format: str, *args) -> None:
        print(f"[soap-service] {self.address_string()} - {format % args}", flush=True)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", 9000), SoapHandler)
    print("OrderService SOAP/WSDL/WSS listening on :9000", flush=True)
    server.serve_forever()
