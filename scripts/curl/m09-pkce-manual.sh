#!/usr/bin/env bash
set -euo pipefail

KC_AUTH_URL="${KC_AUTH_URL:-http://localhost:8081/realms/api-lab/protocol/openid-connect/auth}"
CLIENT_ID="bruno-pkce-client"
REDIRECT_URI="http://localhost:8080/callback"

echo "[1/4] Erzeuge kryptografischen PKCE code_verifier und S256 code_challenge..."
CODE_VERIFIER="$(openssl rand -base64 32 | tr '+/' '-_' | tr -d '=')"
CODE_CHALLENGE="$(printf '%s' "${CODE_VERIFIER}" | openssl dgst -sha256 -binary | openssl base64 -A | tr '+/' '-_' | tr -d '=')"
echo "  -> code_verifier  (${#CODE_VERIFIER} Zeichen): ${CODE_VERIFIER}"
echo "  -> code_challenge (S256): ${CODE_CHALLENGE}"

check_auth_redirect_error() {
  local label="$1"
  local expected_err="$2"
  local url="$3"
  local headers
  headers="$(curl -sS -D - -o /dev/null "${url}")"
  if echo "${headers}" | grep -qE "^HTTP/[0-9.]+ 302" && echo "${headers}" | grep -qi "Location:.*error=${expected_err}"; then
    echo "  -> [OK] ${label}: HTTP 302 mit error=${expected_err} im Location-Header"
  else
    echo "  -> [FAIL] ${label}: unerwartete Antwort:" >&2
    echo "${headers}" >&2
    exit 1
  fi
}

echo "[2/4] Pruefe Ablehnung von Implicit Grant (response_type=token)..."
check_auth_redirect_error "Implicit Grant abgelehnt" "unauthorized_client" \
  "${KC_AUTH_URL}?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=openid"

echo "[3/4] Pruefe Ablehnung von fehlendem PKCE und Methode 'plain'..."
check_auth_redirect_error "Fehlendes PKCE abgelehnt" "invalid_request" \
  "${KC_AUTH_URL}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=openid"

check_auth_redirect_error "PKCE plain abgelehnt" "invalid_request" \
  "${KC_AUTH_URL}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=openid&code_challenge=${CODE_VERIFIER}&code_challenge_method=plain"

echo "[4/4] Pruefe Akzeptanz von PKCE S256..."
OK_CODE="$(curl -sS -o /dev/null -w "%{http_code}" \
  "${KC_AUTH_URL}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=openid&code_challenge=${CODE_CHALLENGE}&code_challenge_method=S256")"
if [[ "${OK_CODE}" == "200" ]]; then
  echo "  -> [OK] PKCE S256 akzeptiert: HTTP ${OK_CODE} (Keycloak Login-Seite)"
else
  echo "  -> [FAIL] PKCE S256: erwartet HTTP 200, erhalten HTTP ${OK_CODE}" >&2
  exit 1
fi

echo "OAuth-2.1-/RFC-9700-PKCE-Haertungspruefung erfolgreich bestanden."
