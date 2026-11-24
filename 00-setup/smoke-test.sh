#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
CERT_DIR="${ROOT_DIR}/lab/certs/out"

PASS=0
FAIL=0

check_cli() {
  local bin="$1"
  if command -v "${bin}" >/dev/null 2>&1; then
    echo "[OK]   CLI gefunden: ${bin}"
    PASS=$((PASS + 1))
  else
    echo "[FAIL] CLI fehlt: ${bin}"
    FAIL=$((FAIL + 1))
  fi
}

check_http() {
  local name="$1"
  local url="$2"
  shift 2
  local status
  status="$(curl -sS -o /dev/null -w "%{http_code}" --max-time 5 "$@" "${url}" 2>/dev/null)" || status="000"
  if [[ "${status}" == "200" ]]; then
    echo "[OK]   ${name} (${url}) -> HTTP ${status}"
    PASS=$((PASS + 1))
  else
    echo "[FAIL] ${name} (${url}) -> HTTP ${status}"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== 1. Werkzeug-Check ==="
check_cli docker
check_cli curl
check_cli jq
check_cli openssl
check_cli bru

echo ""
echo "=== 2. Secret-Hygiene & Zertifikate ==="
if git -C "${ROOT_DIR}" check-ignore -q lab/.env; then
  echo "[OK]   lab/.env wird von .gitignore ignoriert"
  PASS=$((PASS + 1))
else
  echo "[FAIL] lab/.env ist NICHT in .gitignore!"
  FAIL=$((FAIL + 1))
fi

for f in ca.crt server.crt server.key client.crt client.key client.pfx; do
  if [[ -f "${CERT_DIR}/${f}" ]]; then
    echo "[OK]   Zertifikat vorhanden: lab/certs/out/${f}"
    PASS=$((PASS + 1))
  else
    echo "[FAIL] Zertifikat fehlt: lab/certs/out/${f} (fuehre ./lab/certs/generate-certs.sh aus)"
    FAIL=$((FAIL + 1))
  fi
done

echo ""
echo "=== 3. Warte auf Keycloak (max. 90s) ==="
for _ in $(seq 1 30); do
  if curl -fsS --max-time 2 "http://localhost:8081/realms/api-lab/.well-known/openid-configuration" >/dev/null 2>&1; then
    break
  fi
  sleep 3
done

echo ""
echo "=== 4. Labor-Endpunkte ==="
check_http "Petstore3 (OpenAPI)" "http://localhost:8080/api/v3/openapi.json"
check_http "go-httpbin (HTTP)" "http://localhost:8180/status/200"
check_http "tls-proxy (Custom CA TLS)" "https://localhost:8444/status/200" --cacert "${CERT_DIR}/ca.crt"
check_http "tls-proxy (mTLS)" "https://localhost:8443/headers" --cacert "${CERT_DIR}/ca.crt" --cert "${CERT_DIR}/client.crt" --key "${CERT_DIR}/client.key"
check_http "soap-service (WSDL)" "http://localhost:9000/soap?wsdl"
check_http "mock-oauth2-server" "http://localhost:8090/isalive"
check_http "Keycloak (OIDC Discovery)" "http://localhost:8081/realms/api-lab/.well-known/openid-configuration"

echo ""
echo "=== Ergebnis: ${PASS} OK, ${FAIL} FEHLER ==="
if [[ "${FAIL}" -gt 0 ]]; then
  exit 1
fi
