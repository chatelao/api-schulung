# Musterlösung M08: SOAP WS-Security (WSS)

## Lösung Aufgabe A: Ungesicherter Aufruf wird abgelehnt

```bash
curl -sS -X POST http://localhost:9000/soap/secure \
  -H "Content-Type: text/xml; charset=utf-8" \
  -H 'SOAPAction: "http://api-schulung.local/orders/v1/CreateSecureOrder"' \
  --data-binary @- <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="http://api-schulung.local/orders/v1">
  <soap:Body>
    <tns:CreateSecureOrderRequest>
      <tns:orderId>ORD-1000</tns:orderId>
      <tns:customerId>CUST-42</tns:customerId>
      <tns:netAmount>99.80</tns:netAmount>
    </tns:CreateSecureOrderRequest>
  </soap:Body>
</soap:Envelope>
EOF
```

Erwartete Antwort (HTTP `500`): `<faultcode>wsse:FailedAuthentication</faultcode>` mit `<faultstring>Fehlender &lt;soap:Header&gt; mit &lt;wsse:Security&gt;.</faultstring>`.

## Lösung Aufgabe B & C: SoapUI OS 5.10.1 WSS-Workflow

Das vorkonfigurierte Projekt liegt unter [collections/soapui/order-service-wss-soapui-project.xml](../../collections/soapui/order-service-wss-soapui-project.xml):
- **Keystore-Pfad:** `../../lab/certs/out/client-keystore.jks` (Passwort: `CHANGE_ME_LAB_ONLY`)
- **Outgoing WSS (`LabOutgoingWSS`):**
  1. `Timestamp` (`TTL=300`)
  2. `Username` (`lab-wss-user` / `CHANGE_ME_LAB_WSS_PASS`, `PasswordDigest`, `Nonce=true`, `Created=true`)
  3. `Signature` (Alias `api-lab-client`, Part `Body` im Namespace `http://schemas.xmlsoap.org/soap/envelope/`)
- **Manipulationstest (Aufgabe C):** Nach *Apply Outgoing WSS* erzeugt das Ändern von `CUST-42` zu `CUST-43` eine `wsse:FailedCheck`-Fehlermeldung (`DigestValue`-Mismatch).

## Lösung Bonus-Challenge D: Terminal-Verifikation mit Python (`lxml` + `signxml`)

```python
import base64, hashlib, os, urllib.request
from datetime import datetime, timedelta, timezone
from lxml import etree
from signxml import XMLSigner

SOAP_NS = "http://schemas.xmlsoap.org/soap/envelope/"
WSSE_NS = "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
WSU_NS = "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"
TNS = "http://api-schulung.local/orders/v1"

now = datetime.now(timezone.utc)
created = now.strftime("%Y-%m-%dT%H:%M:%SZ")
expires = (now + timedelta(minutes=5)).strftime("%Y-%m-%dT%H:%M:%SZ")
raw_nonce = os.urandom(16)
digest = base64.b64encode(hashlib.sha1(raw_nonce + created.encode() + b"CHANGE_ME_LAB_WSS_PASS").digest()).decode()

env = etree.Element(f"{{{SOAP_NS}}}Envelope", nsmap={"soap": SOAP_NS, "tns": TNS, "wsse": WSSE_NS, "wsu": WSU_NS})
header = etree.SubElement(env, f"{{{SOAP_NS}}}Header")
sec = etree.SubElement(header, f"{{{WSSE_NS}}}Security")
ts = etree.SubElement(sec, f"{{{WSU_NS}}}Timestamp", attrib={"Id": "ts-1"})
etree.SubElement(ts, f"{{{WSU_NS}}}Created").text = created
etree.SubElement(ts, f"{{{WSU_NS}}}Expires").text = expires
ut = etree.SubElement(sec, f"{{{WSSE_NS}}}UsernameToken")
etree.SubElement(ut, f"{{{WSSE_NS}}}Username").text = "lab-wss-user"
pw = etree.SubElement(ut, f"{{{WSSE_NS}}}Password", Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest")
pw.text = digest
etree.SubElement(ut, f"{{{WSSE_NS}}}Nonce").text = base64.b64encode(raw_nonce).decode()
etree.SubElement(ut, f"{{{WSU_NS}}}Created").text = created

body = etree.SubElement(env, f"{{{SOAP_NS}}}Body", attrib={"Id": "body-1"})
req_el = etree.SubElement(body, f"{{{TNS}}}CreateSecureOrderRequest")
etree.SubElement(req_el, f"{{{TNS}}}orderId").text = "ORD-1000"
etree.SubElement(req_el, f"{{{TNS}}}customerId").text = "CUST-42"
etree.SubElement(req_el, f"{{{TNS}}}netAmount").text = "99.80"

key = open("lab/certs/out/client.key", "rb").read()
cert = open("lab/certs/out/client.crt", "rb").read()
signed_sig = XMLSigner().sign(env, key=key, cert=cert, reference_uri="#body-1")
sec.append(signed_sig.find(".//{http://www.w3.org/2000/09/xmldsig#}Signature"))

req = urllib.request.Request(
    "http://localhost:9000/soap/secure",
    data=etree.tostring(env, xml_declaration=True, encoding="UTF-8"),
    headers={"Content-Type": "text/xml; charset=utf-8", "SOAPAction": '"http://api-schulung.local/orders/v1/CreateSecureOrder"'},
)
print(urllib.request.urlopen(req).read().decode())
```
