#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
PAYLOAD_DIR="${ROOT_DIR}/01-module/M03-soap-wsdl-soapui-curl/beispiel-payloads"
SOAP_URL="${SOAP_BASE_URL:-http://localhost:9000/soap}"

echo "[1/4] Pruefe WSDL-Endpunkt..."
curl -fsS "${SOAP_URL}?wsdl" | grep -q "OrderServiceSoap11Binding"
echo "  -> WSDL valide geladen."

echo "[2/4] Sende SOAP 1.1 CreateOrder via --data-binary..."
RESP_11="$(curl -sS --fail-with-body -X POST "${SOAP_URL}" \
  -H "Content-Type: text/xml; charset=utf-8" \
  -H 'SOAPAction: "http://api-schulung.local/orders/v1/CreateOrder"' \
  --data-binary @"${PAYLOAD_DIR}/create-order-soap11.xml")"
echo "${RESP_11}" | grep -q "orderId"
echo "  -> SOAP 1.1 CreateOrder erfolgreich (200 OK)."

echo "[3/4] Sende SOAP 1.2 CalculateTax via --data-binary..."
RESP_12="$(curl -sS --fail-with-body -X POST "${SOAP_URL}" \
  -H "Content-Type: application/soap+xml; charset=utf-8" \
  --data-binary @"${PAYLOAD_DIR}/create-order-soap12.xml")"
echo "${RESP_12}" | grep -q "grossAmount"
echo "  -> SOAP 1.2 CalculateTax erfolgreich (200 OK)."

echo "[4/4] Provoziere XSD-Fault (erwarte HTTP 500 + soap:Client)..."
FAULT_CODE="$(curl -sS -o /tmp/m03-fault.xml -w "%{http_code}" -X POST "${SOAP_URL}" \
  -H "Content-Type: text/xml; charset=utf-8" \
  -H 'SOAPAction: "http://api-schulung.local/orders/v1/CreateOrder"' \
  --data-binary @"${PAYLOAD_DIR}/invalid-xsd-fault.xml")"

if [[ "${FAULT_CODE}" == "500" ]] && grep -q "soap:Client" /tmp/m03-fault.xml; then
  echo "  -> OK: Erwarteter SOAP 1.1 Client-Fault (HTTP 500) empfangen."
else
  echo "  -> FEHLER: Unerwartete Antwort (HTTP ${FAULT_CODE})" >&2
  cat /tmp/m03-fault.xml >&2
  exit 1
fi
