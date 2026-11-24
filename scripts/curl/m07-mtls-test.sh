#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
CERT_DIR="${ROOT_DIR}/lab/certs/out"

echo "[1/3] Server-TLS mit Custom CA (Port 8444, kein -k!)..."
curl -sS --fail-with-body --cacert "${CERT_DIR}/ca.crt" \
  "https://localhost:8444/headers" | jq '.headers."X-Tls-Mode"'

echo "[2/3] Negativtest mTLS ohne Client-Zertifikat (Port 8443, erwarte Ablehnung)..."
NEG_STATUS="$(curl -sS -o /dev/null -w "%{http_code}" --cacert "${CERT_DIR}/ca.crt" "https://localhost:8443/headers" 2>/dev/null)" || NEG_STATUS="TLS_ERR"
if [[ "${NEG_STATUS}" == "400" || "${NEG_STATUS}" == "TLS_ERR" ]]; then
  echo "  -> OK: Verbindung ohne Client-Zertifikat wurde abgewiesen (${NEG_STATUS})."
else
  echo "  -> FEHLER: Unerwarteter Status ${NEG_STATUS} ohne Client-Zertifikat!" >&2
  exit 1
fi

echo "[3/3] Positivtest mTLS mit Client-Zertifikat + Key (Port 8443)..."
curl -sS --fail-with-body \
  --cacert "${CERT_DIR}/ca.crt" \
  --cert "${CERT_DIR}/client.crt" \
  --key "${CERT_DIR}/client.key" \
  "https://localhost:8443/headers" | jq '.headers | {"X-Tls-Mode", "X-Client-Cert-Verify", "X-Client-Cert-Dn"}'
