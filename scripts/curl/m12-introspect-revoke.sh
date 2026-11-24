#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

if [[ -f "${ROOT_DIR}/lab/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${ROOT_DIR}/lab/.env"
  set +a
fi

KC_OIDC="http://localhost:8081/realms/api-lab/protocol/openid-connect"
CLIENT_ID="${KC_M2M_CLIENT_ID:-m2m-service-client}"
CLIENT_SECRET="${KC_M2M_CLIENT_SECRET:-CHANGE_ME_LAB_M2M_SECRET}"

echo "[1/4] Hole Access Token via Client Credentials..."
TOKEN="$(curl -sS --fail-with-body -K - "${KC_OIDC}/token" <<EOF | jq -r '.access_token'
user = "${CLIENT_ID}:${CLIENT_SECRET}"
data = "grant_type=client_credentials"
EOF
)"

echo "[2/4] Introspection VOR Revocation (RFC 7662 -> erwarte active=true)..."
ACTIVE_BEFORE="$(curl -sS --fail-with-body -K - "${KC_OIDC}/token/introspect" <<EOF | jq -r '.active'
user = "${CLIENT_ID}:${CLIENT_SECRET}"
data = "token=${TOKEN}"
EOF
)"
echo "  -> active = ${ACTIVE_BEFORE}"
[[ "${ACTIVE_BEFORE}" == "true" ]] || { echo "FEHLER: Token sollte aktiv sein!" >&2; exit 1; }

echo "[3/4] Widerrufe Token via RFC 7009 (/revoke)..."
REVOKE_CODE="$(curl -sS -o /dev/null -w "%{http_code}" -K - "${KC_OIDC}/revoke" <<EOF
user = "${CLIENT_ID}:${CLIENT_SECRET}"
data = "token=${TOKEN}&token_type_hint=access_token"
EOF
)"
echo "  -> Revocation HTTP Status: ${REVOKE_CODE}"
[[ "${REVOKE_CODE}" == "200" ]] || exit 1

echo "[4/4] Introspection NACH Revocation (erwarte active=false)..."
ACTIVE_AFTER="$(curl -sS --fail-with-body -K - "${KC_OIDC}/token/introspect" <<EOF | jq -r '.active'
user = "${CLIENT_ID}:${CLIENT_SECRET}"
data = "token=${TOKEN}"
EOF
)"
echo "  -> active = ${ACTIVE_AFTER}"
[[ "${ACTIVE_AFTER}" == "false" ]] || { echo "FEHLER: Widerrufenes Token wurde noch als active=true gemeldet!" >&2; exit 1; }

echo "Token-Lifecycle (Introspection -> Revocation -> Re-Check) erfolgreich nachgewiesen."
