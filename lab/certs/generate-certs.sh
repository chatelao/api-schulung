#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAB_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
OUT_DIR="${SCRIPT_DIR}/out"

# Lade optionale lab/.env, falls vorhanden
if [[ -f "${LAB_DIR}/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${LAB_DIR}/.env"
  set +a
fi

CERT_PASS="${LAB_CERT_PASSWORD:-CHANGE_ME_LAB_ONLY}"

mkdir -p "${OUT_DIR}"

echo "[1/5] Erzeuge Root-CA (ca.key, ca.crt)..."
openssl genrsa -out "${OUT_DIR}/ca.key" 4096 2>/dev/null
openssl req -x509 -new -nodes -key "${OUT_DIR}/ca.key" \
  -sha256 -days 825 \
  -subj "/C=CH/O=API-Schulung Lab/CN=API-Schulung Lab Root CA" \
  -addext "basicConstraints=critical,CA:TRUE" \
  -addext "keyUsage=critical,keyCertSign,cRLSign" \
  -out "${OUT_DIR}/ca.crt"

echo "[2/5] Erzeuge Server-Zertifikat mit SANs (server.key, server.crt)..."
cat > "${OUT_DIR}/server-ext.cnf" <<'EOF'
basicConstraints=CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=DNS:localhost,DNS:host.docker.internal,DNS:tls-proxy,IP:127.0.0.1
EOF

openssl genrsa -out "${OUT_DIR}/server.key" 2048 2>/dev/null
openssl req -new -key "${OUT_DIR}/server.key" \
  -subj "/C=CH/O=API-Schulung Lab/CN=localhost" \
  -out "${OUT_DIR}/server.csr"
openssl x509 -req -in "${OUT_DIR}/server.csr" \
  -CA "${OUT_DIR}/ca.crt" -CAkey "${OUT_DIR}/ca.key" -CAcreateserial \
  -out "${OUT_DIR}/server.crt" -days 365 -sha256 \
  -extfile "${OUT_DIR}/server-ext.cnf" 2>/dev/null

echo "[3/5] Erzeuge Client-Zertifikat fuer mTLS & WS-Security (client.key, client.crt)..."
cat > "${OUT_DIR}/client-ext.cnf" <<'EOF'
basicConstraints=CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=clientAuth
EOF

openssl genrsa -out "${OUT_DIR}/client.key" 2048 2>/dev/null
openssl req -new -key "${OUT_DIR}/client.key" \
  -subj "/C=CH/O=API-Schulung Lab/OU=Students/CN=api-lab-client" \
  -out "${OUT_DIR}/client.csr"
openssl x509 -req -in "${OUT_DIR}/client.csr" \
  -CA "${OUT_DIR}/ca.crt" -CAkey "${OUT_DIR}/ca.key" -CAcreateserial \
  -out "${OUT_DIR}/client.crt" -days 365 -sha256 \
  -extfile "${OUT_DIR}/client-ext.cnf" 2>/dev/null

echo "[4/5] Exportiere PKCS#12 Bundle (client.pfx)..."
openssl pkcs12 -export \
  -out "${OUT_DIR}/client.pfx" \
  -inkey "${OUT_DIR}/client.key" \
  -in "${OUT_DIR}/client.crt" \
  -certfile "${OUT_DIR}/ca.crt" \
  -name "api-lab-client" \
  -passout "pass:${CERT_PASS}"

echo "[5/5] Erzeuge Java Keystore/Truststore fuer SoapUI OS 5.10.1..."
rm -f "${OUT_DIR}/client-keystore.jks" "${OUT_DIR}/lab-truststore.jks"
if command -v keytool >/dev/null 2>&1; then
  keytool -importkeystore \
    -srckeystore "${OUT_DIR}/client.pfx" -srcstoretype PKCS12 -srcstorepass "${CERT_PASS}" \
    -destkeystore "${OUT_DIR}/client-keystore.jks" -deststoretype JKS -deststorepass "${CERT_PASS}" \
    -noprompt 2>/dev/null
  keytool -importcert -trustcacerts \
    -alias "api-lab-ca" \
    -file "${OUT_DIR}/ca.crt" \
    -keystore "${OUT_DIR}/lab-truststore.jks" -storetype JKS -storepass "${CERT_PASS}" \
    -noprompt 2>/dev/null
  echo "  -> JKS-Dateien erstellt (client-keystore.jks, lab-truststore.jks)."
else
  echo "  -> WARNUNG: 'keytool' nicht gefunden. PEM/PFX wurden erzeugt; JKS-Dateien fuer SoapUI erfordern ein JDK."
fi

# Aufraeumen temporaerer CSR/CNF-Dateien
rm -f "${OUT_DIR}/server.csr" "${OUT_DIR}/client.csr" "${OUT_DIR}/server-ext.cnf" "${OUT_DIR}/client-ext.cnf"

# Leserechte fuer lokale Container (nginx / python soap-service); NUR FUER LOKALES DOCKER-LAB!
chmod 644 "${OUT_DIR}"/*.crt "${OUT_DIR}"/*.key "${OUT_DIR}"/*.pfx 2>/dev/null || true

echo "Fertig! Zertifikate liegen unter: ${OUT_DIR}"
ls -lh "${OUT_DIR}"
