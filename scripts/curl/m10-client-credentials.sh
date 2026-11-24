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

TOKEN_URL="${KC_TOKEN_URL:-http://localhost:8081/realms/api-lab/protocol/openid-connect/token}"
HTTPBIN_URL="${HTTPBIN_BASE_URL:-http://localhost:8180}"
CLIENT_ID="${KC_M2M_CLIENT_ID:-m2m-service-client}"
CLIENT_SECRET="${KC_M2M_CLIENT_SECRET:-CHANGE_ME_LAB_M2M_SECRET}"

echo "[1/3] Beziehe M2M Access Token per Client Credentials (via -K - ohne CLI-Secret)..."
TOKEN_RESP="$(curl -sS --fail-with-body -K - "${TOKEN_URL}" <<EOF
user = "${CLIENT_ID}:${CLIENT_SECRET}"
data = "grant_type=client_credentials"
EOF
)"

ACCESS_TOKEN="$(echo "${TOKEN_RESP}" | jq -r '.access_token')"
if [[ -z "${ACCESS_TOKEN}" || "${ACCESS_TOKEN}" == "null" ]]; then
  echo "FEHLER: Kein access_token erhalten!" >&2
  exit 1
fi
echo "  -> Access Token erhalten (Laenge: ${#ACCESS_TOKEN} Zeichen)."

echo "[2/3] Inspiziere JWT-Claims (Nur Inspektion, keine Signaturpruefung!)..."
PAYLOAD_B64="$(echo "${ACCESS_TOKEN}" | cut -d. -f2)"
while (( ${#PAYLOAD_B64} % 4 != 0 )); do PAYLOAD_B64="${PAYLOAD_B64}="; done
printf '%s' "${PAYLOAD_B64}" | tr '_-' '/+' | base64 -d \
  | jq '{iss, sub, azp, aud, scope, exp}'

echo "[3/3] Rufe geschuetzten Endpunkt mit --oauth2-bearer via -K - auf..."
curl -sS --fail-with-body -K - "${HTTPBIN_URL}/bearer" <<EOF | jq '{authenticated}'
oauth2-bearer = "${ACCESS_TOKEN}"
EOF
