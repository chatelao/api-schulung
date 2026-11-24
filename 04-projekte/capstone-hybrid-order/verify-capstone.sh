#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
CAP_BRUNO="${ROOT_DIR}/collections/bruno/capstone-hybrid-order"

if [[ -f "${ROOT_DIR}/lab/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${ROOT_DIR}/lab/.env"
  set +a
fi

echo "=== [1/4] Smoke-Test Labor-Stack ==="
"${ROOT_DIR}/00-setup/smoke-test.sh"

echo ""
echo "=== [2/4] Bruno Capstone Suite (OIDC + Petstore + mTLS + SOAP + RFC 7009 Revocation) ==="
cp "${CAP_BRUNO}/client-cert-config.example.json" "${CAP_BRUNO}/client-cert-config.json"
trap 'rm -f "${CAP_BRUNO}/client-cert-config.json"' EXIT

(
  cd "${CAP_BRUNO}"
  JUNIT_ARGS=()
  if [[ -n "${CAPSTONE_JUNIT_REPORT:-}" ]]; then
    JUNIT_ARGS=(--reporter-junit "${CAPSTONE_JUNIT_REPORT}")
  fi
  bru run -r --env local \
    --cacert "${ROOT_DIR}/lab/certs/out/ca.crt" \
    --client-cert-config ./client-cert-config.json \
    --env-var "m2mClientSecret=${KC_M2M_CLIENT_SECRET:-CHANGE_ME_LAB_M2M_SECRET}" \
    --reporter-skip-headers Authorization \
    "${JUNIT_ARGS[@]}"
)

echo ""
echo "=== [3/4] WS-Security XML-Signaturpruefung gegen /soap/secure ==="
python3 - <<PY
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
wss_pass = os.environ.get("SOAP_WSS_PASS", "CHANGE_ME_LAB_WSS_PASS").encode("utf-8")
digest = base64.b64encode(hashlib.sha1(raw_nonce + created.encode() + wss_pass).digest()).decode()

env = etree.Element(f"{{{SOAP_NS}}}Envelope", nsmap={"soap": SOAP_NS, "tns": TNS, "wsse": WSSE_NS, "wsu": WSU_NS})
header = etree.SubElement(env, f"{{{SOAP_NS}}}Header")
sec = etree.SubElement(header, f"{{{WSSE_NS}}}Security")
ts = etree.SubElement(sec, f"{{{WSU_NS}}}Timestamp", attrib={"Id": "ts-cap"})
etree.SubElement(ts, f"{{{WSU_NS}}}Created").text = created
etree.SubElement(ts, f"{{{WSU_NS}}}Expires").text = expires
ut = etree.SubElement(sec, f"{{{WSSE_NS}}}UsernameToken")
etree.SubElement(ut, f"{{{WSSE_NS}}}Username").text = os.environ.get("SOAP_WSS_USER", "lab-wss-user")
pw = etree.SubElement(ut, f"{{{WSSE_NS}}}Password", Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest")
pw.text = digest
etree.SubElement(ut, f"{{{WSSE_NS}}}Nonce").text = base64.b64encode(raw_nonce).decode()
etree.SubElement(ut, f"{{{WSU_NS}}}Created").text = created

body = etree.SubElement(env, f"{{{SOAP_NS}}}Body", attrib={"Id": "body-cap"})
req_el = etree.SubElement(body, f"{{{TNS}}}CreateSecureOrderRequest")
etree.SubElement(req_el, f"{{{TNS}}}orderId").text = "ORD-CAPSTONE-1"
etree.SubElement(req_el, f"{{{TNS}}}customerId").text = "CUST-CAPSTONE"
etree.SubElement(req_el, f"{{{TNS}}}netAmount").text = "199.00"

key = open("${ROOT_DIR}/lab/certs/out/client.key", "rb").read()
cert = open("${ROOT_DIR}/lab/certs/out/client.crt", "rb").read()
signed_doc = XMLSigner().sign(env, key=key, cert=cert, reference_uri="#body-cap")
sec.append(signed_doc.find(".//{http://www.w3.org/2000/09/xmldsig#}Signature"))

req = urllib.request.Request(
    "http://localhost:9000/soap/secure",
    data=etree.tostring(env, xml_declaration=True, encoding="UTF-8"),
    headers={"Content-Type": "text/xml; charset=utf-8", "SOAPAction": '"http://api-schulung.local/orders/v1/CreateSecureOrder"'},
)
resp = urllib.request.urlopen(req).read().decode()
assert "<tns:billingStatus>BILLED_SECURE</tns:billingStatus>" in resp, resp
assert "<tns:signatureVerified>true</tns:signatureVerified>" in resp, resp
print("[OK] SOAP/WSS CreateSecureOrder mit XML-Signatur erfolgreich verifiziert.")
PY

echo ""
echo "=== [4/4] Hygiene-Audit (keine .bru-Dateien, keine getrackten Secrets/Keys) ==="
test -z "$(find "${ROOT_DIR}/collections/bruno" -name '*.bru')"
echo "[OK] Keine .bru-Dateien unter collections/bruno/."
git -C "${ROOT_DIR}" ls-files | grep -E '(\.env$|\.key$|\.pfx$|\.p12$|\.jks$|client-cert-config\.json$)' && {
  echo "[FAIL] Vertrauliche Datei in Git getrackt!" >&2
  exit 1
} || echo "[OK] Keine vertraulichen Schluessel oder .env-Dateien in Git getrackt."

echo ""
echo "CAPSTONE VERIFIKATION ERFOLGREICH ABGESCHLOSSEN."
