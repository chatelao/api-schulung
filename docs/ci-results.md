# CI/CD Verifikationsergebnisse

Diese Seite dokumentiert den automatisierten Prüflauf des Workflows **Verify API-Schulung Labs**.

- **Zeitstempel:** `2026-11-24 20:13:12 UTC`
- **Commit / Referenz:** `main`
- **GitHub Actions Run:** [local](https://github.com/chatelao/api-schulung/actions)
- **GitHub Pages:** [https://chatelao.github.io/api-schulung/](https://chatelao.github.io/api-schulung/)
- **Read the Docs:** [https://api-schulung.readthedocs.io/](https://api-schulung.readthedocs.io/)

## Testergebnisse

| Bereich | Verifikation | Status |
| :--- | :--- | :---: |
| Labor-Stack (`smoke-test.sh`) | Petstore3, go-httpbin, tls-proxy (TLS/mTLS), soap-service, Keycloak 26.8.2, mock-oauth2 | **PASS** |
| `curl`-Skripte (`m01`–`m12`) | 8 ausführbare Skripte (CRUD, SOAP, Auth-Hygiene, mTLS, PKCE, M2M, OIDC, Introspect/Revoke) | **PASS** |
| Bruno Collections (`bru run`) | `petstore-lab`, `auth-hygiene-lab`, `oauth-client-credentials-lab`, `security-audit-suite`, `capstone-hybrid-order` | **PASS** |
| WS-Security XML-Signatur | `CreateSecureOrder` (`Timestamp` + `UsernameToken Digest` + `XML Signature`) | **PASS** |

## Geprüfte Qualitäts- & Sicherheitsgates

1. **Shell- & Schema-Hygiene:** `bash -n` auf allen `.sh`-Skripten, Python-Kompilierung (`app.py`), YAML/JSON/XML/WSDL-Syntaxprüfung.
2. **OpenCollection-Formatreinheit:** `0` `.bru`-Dateien im gesamten `collections/bruno/`-Verzeichnis.
3. **Secret-Hygiene:** Keine `.env`, privaten Schlüssel (`*.key`, `*.pfx`, `*.jks`) oder `client-cert-config.json` in Git getrackt; `--reporter-skip-headers Authorization` bei allen `bru run`-Läufen.
4. **OAuth 2.1 / OIDC & Transport:** PKCE `S256`-Erzwingung am Keycloak-Client `bruno-pkce-client`, striktes mTLS (`8443`), Custom CA (`8444`) und RFC-7662/7009-Introspection/Revocation.
