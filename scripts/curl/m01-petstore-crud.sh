#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${PETSTORE_BASE_URL:-http://localhost:8080/api/v3}"
PET_ID=2026

echo "[1/5] Lege Pet ${PET_ID} via POST --json an..."
CREATED_JSON="$(curl -sS --fail-with-body --json "{
  \"id\": ${PET_ID},
  \"name\": \"Luna\",
  \"category\": {\"id\": 1, \"name\": \"Dogs\"},
  \"photoUrls\": [\"https://example.invalid/luna.png\"],
  \"status\": \"available\"
}" "${BASE_URL}/pet")"

EXTRACTED_ID="$(echo "${CREATED_JSON}" | jq -r '.id')"
echo "  -> Angelegt mit ID: ${EXTRACTED_ID}"

echo "[2/5] Rufe Pet ${EXTRACTED_ID} via GET ab..."
curl -sS --fail-with-body -H "Accept: application/json" "${BASE_URL}/pet/${EXTRACTED_ID}" \
  | jq '{id, name, status}'

echo "[3/5] Aktualisiere Status auf 'sold' via PUT..."
curl -sS --fail-with-body -X PUT --json "{
  \"id\": ${EXTRACTED_ID},
  \"name\": \"Luna\",
  \"category\": {\"id\": 1, \"name\": \"Dogs\"},
  \"photoUrls\": [\"https://example.invalid/luna.png\"],
  \"status\": \"sold\"
}" "${BASE_URL}/pet" | jq '{id, name, status}'

echo "[4/5] Loesche Pet ${EXTRACTED_ID} via DELETE..."
curl -sS --fail-with-body -X DELETE "${BASE_URL}/pet/${EXTRACTED_ID}" >/dev/null
echo "  -> Geloescht."

echo "[5/5] Verifiziere HTTP 404 nach Loeschung..."
STATUS_AFTER_DELETE="$(curl -sS -o /dev/null -w "%{http_code}" "${BASE_URL}/pet/${EXTRACTED_ID}")"
if [[ "${STATUS_AFTER_DELETE}" == "404" ]]; then
  echo "  -> OK: Ressource liefert HTTP 404."
else
  echo "  -> FEHLER: Erwartet 404, erhalten ${STATUS_AFTER_DELETE}" >&2
  exit 1
fi
