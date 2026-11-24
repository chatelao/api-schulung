#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
HTTPBIN_URL="${HTTPBIN_BASE_URL:-http://localhost:8180}"

if [[ -f "${ROOT_DIR}/lab/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${ROOT_DIR}/lab/.env"
  set +a
fi

BASIC_USER="${HTTPBIN_BASIC_USER:-labuser}"
BASIC_PASS="${HTTPBIN_BASIC_PASS:-CHANGE_ME_LAB_HTTPBIN}"
API_KEY="${HTTPBIN_API_KEY:-CHANGE_ME_LAB_API_KEY}"
BEARER_TOKEN="${HTTPBIN_BEARER_TOKEN:-CHANGE_ME_LAB_STATIC_BEARER}"

echo "[1/4] HTTP Basic Auth via curl -K - (kein Passwort in Prozessliste)..."
curl -sS --fail-with-body -K - "${HTTPBIN_URL}/basic-auth/${BASIC_USER}/${BASIC_PASS}" <<EOF | jq '{authorized, user}'
user = "${BASIC_USER}:${BASIC_PASS}"
EOF

echo "[2/4] HTTP Digest Auth via curl --digest -K -..."
curl -sS --fail-with-body --digest -K - "${HTTPBIN_URL}/digest-auth/auth/${BASIC_USER}/${BASIC_PASS}" <<EOF | jq '{authorized, user}'
user = "${BASIC_USER}:${BASIC_PASS}"
EOF

echo "[3/4] Statischer API-Key im Header via curl -K -..."
curl -sS --fail-with-body -K - "${HTTPBIN_URL}/headers" <<EOF | jq '.headers."X-Api-Key"'
header = "X-Api-Key: ${API_KEY}"
EOF

echo "[4/4] Statischer Bearer Token via curl -K - (oauth2-bearer)..."
curl -sS --fail-with-body -K - "${HTTPBIN_URL}/bearer" <<EOF | jq '{authenticated, token}'
oauth2-bearer = "${BEARER_TOKEN}"
EOF

echo "Alle 4 klassischen Auth-Verfahren via -K - (stdin) erfolgreich (200 OK)."
