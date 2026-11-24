# A06: Token-Lifecycle (`RFC 7662` / `7009`), `bru run` & CI/CD

Im abschliessenden Advanced-Modul steuerst du Token-Introspection und -Revocation per `curl` und automatisierst komplette Bruno-OpenCollection-Suites inklusive mTLS über `@usebruno/cli` (`bru`) in GitHub Actions.

## 1. Token Introspection (RFC 7662) & Revocation (RFC 7009)

```bash
./scripts/curl/m12-introspect-revoke.sh
```

Ablauf:
1. Bezieht M2M-Access-Token via `-K -`.
2. Prüft `/token/introspect` → `active: true`.
3. Widerruft Token via `/revoke` → HTTP `200 OK`.
4. Prüft `/token/introspect` erneut → `active: false`.

## 2. Headless `bru run` mit Custom CA, mTLS & Secret-Hygiene

```bash
set -a && source lab/.env && set +a

# Rekursiver Lauf mit mTLS & ausgeblendetem Authorization-Header im Report:
cp collections/bruno/auth-hygiene-lab/client-cert-config.example.json \
   collections/bruno/auth-hygiene-lab/client-cert-config.json
(
  cd collections/bruno/auth-hygiene-lab
  bru run -r --env local \
    --cacert ../../../lab/certs/out/ca.crt \
    --client-cert-config ./client-cert-config.json \
    --env-var "basicUser=${HTTPBIN_BASIC_USER}" \
    --env-var "basicPass=${HTTPBIN_BASIC_PASS}" \
    --env-var "apiKey=${HTTPBIN_API_KEY}" \
    --env-var "bearerToken=${HTTPBIN_BEARER_TOKEN}" \
    --reporter-skip-headers Authorization X-Api-Key \
    --reporter-junit ../../../reports/auth-hygiene.xml
)
rm -f collections/bruno/auth-hygiene-lab/client-cert-config.json
```

## 3. Automatisierte Security-Audit-Suite & Capstone-CLI-Abnahme

```bash
# 6 automatisierte Security-Audit-Negativtests:
(
  cd collections/bruno/security-audit-suite
  bru run -r --env ci \
    --env-var "m2mClientSecret=${KC_M2M_CLIENT_SECRET}" \
    --reporter-skip-headers Authorization
)

# Vollstaendiges Capstone-End-to-End-Skript:
./04-projekte/capstone-hybrid-order/verify-capstone.sh
```

## 4. Querverweise

- Referenzskripte: [m12-introspect-revoke.sh](../scripts/curl/m12-introspect-revoke.sh), [verify-capstone.sh](../04-projekte/capstone-hybrid-order/verify-capstone.sh)
- GitHub-Actions-Workflow: [.github/workflows/verify-labs.yml](../.github/workflows/verify-labs.yml)
- Übung: [Advanced-Übungen Aufgabe 6](uebungen.md#aufgabe-a6-introspection-revocation-bru-run-in-ci)
