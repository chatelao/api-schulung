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

KC_DISCOVERY="${KC_DISCOVERY_URL:-http://localhost:8081/realms/api-lab/.well-known/openid-configuration}"
MOCK_DISCOVERY="${MOCK_DISCOVERY_URL:-http://localhost:8090/default/.well-known/openid-configuration}"
CLIENT_ID="${KC_M2M_CLIENT_ID:-m2m-service-client}"
CLIENT_SECRET="${KC_M2M_CLIENT_SECRET:-CHANGE_ME_LAB_M2M_SECRET}"

echo "[1/4] Lade OIDC Discovery-Dokumente (Keycloak & mock-oauth2-server)..."
KC_META="$(curl -sS --fail-with-body "${KC_DISCOVERY}")"
echo "${KC_META}" | jq '{issuer, authorization_endpoint, token_endpoint, userinfo_endpoint, jwks_uri}'
curl -sS --fail-with-body "${MOCK_DISCOVERY}" | jq '{issuer, token_endpoint, jwks_uri}'

TOKEN_URL="$(echo "${KC_META}" | jq -r '.token_endpoint')"
JWKS_URI="$(echo "${KC_META}" | jq -r '.jwks_uri')"

echo "[2/4] Hole signiertes JWT und lese Header (alg, kid)..."
JWT="$(curl -sS --fail-with-body -K - "${TOKEN_URL}" <<EOF | jq -r '.access_token'
user = "${CLIENT_ID}:${CLIENT_SECRET}"
data = "grant_type=client_credentials"
EOF
)"

HEADER_B64="$(echo "${JWT}" | cut -d. -f1)"
while (( ${#HEADER_B64} % 4 != 0 )); do HEADER_B64="${HEADER_B64}="; done
HEADER_JSON="$(printf '%s' "${HEADER_B64}" | tr '_-' '/+' | base64 -d)"
echo "${HEADER_JSON}" | jq .
TOKEN_KID="$(echo "${HEADER_JSON}" | jq -r '.kid')"

echo "[3/4] Ordne kid=${TOKEN_KID} im JWKS (${JWKS_URI}) zu..."
MATCHED_KEY="$(curl -sS --fail-with-body "${JWKS_URI}" | jq --arg kid "${TOKEN_KID}" '.keys[] | select(.kid == $kid) | {kid, kty, alg, use}')"
if [[ -z "${MATCHED_KEY}" ]]; then
  echo "FEHLER: kid ${TOKEN_KID} nicht im JWKS gefunden!" >&2
  exit 1
fi
echo "${MATCHED_KEY}"

echo "[4/4] Hinweis: Base64URL-Dekodierung dient nur der Inspektion; echte Verifikation prueft die Signatur gegen obigen JWKS-Key."
