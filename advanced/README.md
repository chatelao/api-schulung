# Advanced-Track: Shell, `curl` & CLI-Automatisierung

Willkommen im **Advanced-Teil** der `api-schulung`. Während der Basis-Lehrgang (`M01`–`M12`) bewusst grafisch mit **Swagger UI**, **Bruno Desktop** und **SoapUI Open Source** arbeitet und kein Vorwissen mit der Kommandozeile voraussetzt, tauchen wir hier tief in die **Shell- und Transportebene** ein.

## Voraussetzungen

- Abschluss (oder Grundkenntnisse) des Basis-Lehrgangs (`M01`–`M12`)
- Bereitschaft, mit Bash/Zsh, Umgebungsvariablen und Dateiberechtigungen zu arbeiten
- Installierte CLI-Werkzeuge: `curl`, `jq`, `openssl`, `@usebruno/cli` (`bru`)

## Übersicht der Advanced-Module

| Modul | Titel | Referenz-Skript | Inhalt & Fokus |
| :--- | :--- | :--- | :--- |
| [A01](A01-http-curl-jq.md) | HTTP-Fundament & `curl` ohne Magie | [m01-petstore-crud.sh](../scripts/curl/m01-petstore-crud.sh) | `curl -v`, `-L`, `--json`, `--fail-with-body`, `jq`-Pipelines, Timing (`-w`) |
| [A02](A02-soap-curl-databinary.md) | SOAP 1.1/1.2 & `--data-binary` | [m03-soap-call.sh](../scripts/curl/m03-soap-call.sh) | Bytegenauer XML-Versand, `SOAPAction`-Header, SOAP-Fault-Traces, `bru import wsdl` |
| [A03](A03-secret-hygiene-curl.md) | Secret-Hygiene in der Shell | [m05-auth-hygiene.sh](../scripts/curl/m05-auth-hygiene.sh) | `curl -K -` (`stdin`), `--netrc-file`, `--oauth2-bearer`, Schutz vor `~/.bash_history` & `ps` |
| [A04](A04-tls-mtls-openssl-curl.md) | TLS, OpenSSL & mTLS per `curl` | [m07-mtls-test.sh](../scripts/curl/m07-mtls-test.sh) | `openssl x509` SAN-Prüfung, `--cacert` (niemals `-k`), `--cert`/`--key`/`P12` |
| [A05](A05-oauth21-pkce-oidc-curl.md) | OAuth 2.1 PKCE & OIDC per `curl` | [m09-pkce-manual.sh](../scripts/curl/m09-pkce-manual.sh), [m10-client-credentials.sh](../scripts/curl/m10-client-credentials.sh), [m11-oidc-discovery-jwt.sh](../scripts/curl/m11-oidc-discovery-jwt.sh) | Manuelle PKCE-`S256`-Berechnung, M2M Client Credentials via `-K -`, JWKS-`kid`-Matching, Base64URL-Inspektion |
| [A06](A06-token-lifecycle-bruno-cli-cicd.md) | Token-Lifecycle, `bru run` & CI/CD | [m12-introspect-revoke.sh](../scripts/curl/m12-introspect-revoke.sh), [verify-capstone.sh](../04-projekte/capstone-hybrid-order/verify-capstone.sh) | RFC 7662 Introspection, RFC 7009 Revocation, `bru run -r --client-cert-config`, GitHub Actions |

## Übungen & Musterlösungen

- [Alle Advanced-Übungen (Shell & curl)](uebungen.md)
- [Alle Advanced-Musterlösungen](loesungen.md)
