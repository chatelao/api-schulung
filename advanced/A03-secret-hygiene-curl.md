# A03: Secret-Hygiene in der Shell (`-K -` & `--netrc-file`)

**Anti-Pattern:** `curl -u user:geheim http://...` — dieses Kommando landet im Klartext in `~/.bash_history` und ist während der Laufzeit für alle Benutzer via `ps aux` sichtbar!

## 1. Sichere Credential-Übergabe in `curl`

### Option 1: `--config -` (`-K -`) über `stdin` (empfohlen)

```bash
set -a && source lab/.env && set +a

# Basic Auth
curl -sS --fail-with-body -K - "http://localhost:8180/basic-auth/${HTTPBIN_BASIC_USER}/${HTTPBIN_BASIC_PASS}" <<EOF
user = "${HTTPBIN_BASIC_USER}:${HTTPBIN_BASIC_PASS}"
EOF

# Bearer Token via oauth2-bearer
curl -sS --fail-with-body -K - "http://localhost:8180/bearer" <<EOF
oauth2-bearer = "${HTTPBIN_BEARER_TOKEN}"
EOF
```

### Option 2: `--netrc-file` (`chmod 600`, in `.gitignore`)

```bash
cat > /tmp/lab.netrc <<EOF
machine localhost login ${HTTPBIN_BASIC_USER} password ${HTTPBIN_BASIC_PASS}
EOF
chmod 600 /tmp/lab.netrc
curl -sS --fail-with-body --netrc-file /tmp/lab.netrc \
  "http://localhost:8180/basic-auth/${HTTPBIN_BASIC_USER}/${HTTPBIN_BASIC_PASS}"
rm -f /tmp/lab.netrc
```

## 2. Automatisierter Lab-Lauf

```bash
./scripts/curl/m05-auth-hygiene.sh
```

## 3. Querverweise

- Referenzskript: [scripts/curl/m05-auth-hygiene.sh](../scripts/curl/m05-auth-hygiene.sh)
- Übung: [Advanced-Übungen Aufgabe 3](uebungen.md)
