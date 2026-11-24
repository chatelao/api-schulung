# Musterlösung M07: TLS, Custom CA & Mutual TLS (mTLS)

## Lösung Aufgabe A & B: `curl` mit Custom CA und mTLS

Siehe ausführbares Referenzskript: [scripts/curl/m07-mtls-test.sh](../scripts/curl/m07-mtls-test.sh).

Zertifikatsprüfung:
```bash
openssl x509 -in lab/certs/out/server.crt -noout -subject -issuer -ext subjectAltName
openssl x509 -in lab/certs/out/client.crt -noout -subject -issuer
```

## Lösung Aufgabe C: Bruno CLI mTLS-Lauf

```bash
cp collections/bruno/auth-hygiene-lab/client-cert-config.example.json \
   collections/bruno/auth-hygiene-lab/client-cert-config.json

git check-ignore -v collections/bruno/auth-hygiene-lab/client-cert-config.json

(
  cd collections/bruno/auth-hygiene-lab
  bru run tls-mtls --env local \
    --cacert ../../../lab/certs/out/ca.crt \
    --client-cert-config ./client-cert-config.json
)
```

## Lösung Bonus-Challenge D: PKCS#12 via `-K -`

```bash
curl -sS --cacert lab/certs/out/ca.crt -K - https://localhost:8443/headers <<'EOF' | jq '.headers."X-Client-Cert-Verify"'
cert-type = "P12"
cert = "lab/certs/out/client.pfx:CHANGE_ME_LAB_ONLY"
EOF
```
