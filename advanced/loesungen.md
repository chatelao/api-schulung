# Advanced-Musterlösungen: Shell, `curl` & CLI-Automatisierung

Alle Aufgaben lassen sich direkt über die ausführbaren und CI-geprüften Skripte im Verzeichnis `scripts/curl/` nachvollziehen:

| Aufgabe | Referenzskript / Kommando |
| :--- | :--- |
| **A1: HTTP-CRUD & `jq`** | [scripts/curl/m01-petstore-crud.sh](../scripts/curl/m01-petstore-crud.sh) |
| **A2: SOAP 1.1/1.2 & Faults** | [scripts/curl/m03-soap-call.sh](../scripts/curl/m03-soap-call.sh) |
| **A3: Secret-Hygiene (`-K -`)** | [scripts/curl/m05-auth-hygiene.sh](../scripts/curl/m05-auth-hygiene.sh) |
| **A4: Custom CA & mTLS** | [scripts/curl/m07-mtls-test.sh](../scripts/curl/m07-mtls-test.sh) |
| **A5: PKCE, M2M & OIDC JWKS** | [m09-pkce-manual.sh](../scripts/curl/m09-pkce-manual.sh), [m10-client-credentials.sh](../scripts/curl/m10-client-credentials.sh), [m11-oidc-discovery-jwt.sh](../scripts/curl/m11-oidc-discovery-jwt.sh) |
| **A6: Introspection, Revocation & Capstone CLI** | [m12-introspect-revoke.sh](../scripts/curl/m12-introspect-revoke.sh), [verify-capstone.sh](../04-projekte/capstone-hybrid-order/verify-capstone.sh) |

## Komplettprüfung im Terminal

```bash
set -a && source lab/.env && set +a
./00-setup/smoke-test.sh
for s in scripts/curl/*.sh; do ./"$s"; done
./04-projekte/capstone-hybrid-order/verify-capstone.sh
```
