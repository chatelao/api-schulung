# Praxis-Schulung API-Nutzung: curl, Bruno, SoapUI, OpenAPI, SOAP, OAuth 2.1 & OIDC

Willkommen im Kurs-Repository **`api-schulung`**. Dieses Curriculum vermittelt die praxisnahe Nutzung, Analyse, Absicherung und Automatisierung moderner sowie klassischer Programmierschnittstellen (**REST/OpenAPI** und **SOAP/WSDL**) mithilfe der drei komplementären Werkzeuge **`curl`**, **Bruno (OpenCollection YAML)** und **SoapUI Open Source (5.10.1)**.

- **Gesamtumfang:** 26,5 Stunden Netto-Lernzeit (1'590 Minuten)
- **Format:** 4-Tages-Präsenzschulung oder 4-Wochen-Selbststudium
- **Technischer Stand:** November 2026 (OAuth 2.0 Security BCP **RFC 9700**, **OAuth 2.1 Draft-17**, **OpenAPI 3.0 / 3.1**, **Bruno OpenCollection YAML**, **SoapUI OS 5.10.1**)

## Schnellstart

1. Starte die lokale Laborumgebung und prüfe alle Werkzeuge anhand der [QUICK-START.md](QUICK-START.md) (ca. 15 Minuten).
2. Wähle deinen Lernpfad in [LEARNING-GUIDE.md](LEARNING-GUIDE.md).
3. Beginne mit [Modul 0: Labor-Setup & Smoke-Tests](00-setup/README.md).

## Voraussetzungen

- Grundlegende Vertrautheit mit der Kommandozeile (Bash/Zsh/PowerShell)
- Grundkenntnisse in JSON und XML sowie elementaren Web-Begriffen (URL, HTTP-Statuscodes, TLS)
- Installierte Werkzeuge: `docker` (inkl. Docker Compose), `curl`, `jq`, **Bruno Desktop** (v3/v4) + `@usebruno/cli` (`bru`), **SoapUI Open Source 5.10.1**, `openssl` / `keytool`

## Modul-Übersicht (1'590 Minuten / 26,5 Stunden)

| Modul | Titel | Stufe | Dauer | Primäre Werkzeuge | Kernprotokolle & Standards |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [M00](00-setup/README.md) | Labor-Setup, Werkzeug-Check & Smoke-Tests | Einstieg | 45 Min | Docker, curl, Bruno, SoapUI | Lokaler Container-Stack, CLI-Checks |
| [M01](01-module/M01-http-fundament-curl/README.md) | HTTP-Fundament & curl ohne Magie | Stufe 1 | 90 Min | curl, jq | HTTP/1.1 & HTTP/2, Verben, Header, Statuscodes, JSON |
| [M02](01-module/M02-openapi-bruno-yaml/README.md) | Swagger / OpenAPI (2.0, 3.0, 3.1) lesen & mit Bruno nutzen | Stufe 1 | 120 Min | Bruno (YAML & CLI), curl | OpenAPI 3.0/3.1, JSON Schema, OpenCollection YAML |
| [M03](01-module/M03-soap-wsdl-soapui-curl/README.md) | SOAP 1.1/1.2 & WSDL-Verträge in SoapUI und curl | Stufe 1 | 150 Min | SoapUI OS 5.10, curl | WSDL 1.1, XSD, SOAP 1.1 vs. 1.2, Faults |
| [M04](01-module/M04-assertions-chaining-mocking/README.md) | Assertions, Request-Chaining, Scripting & Mocking | Stufe 1 | 120 Min | Bruno, SoapUI OS | Chai-Tests, XPath/XQuery, Property Transfer, MockService |
| [M05](01-module/M05-credentials-secret-hygiene/README.md) | Klassische Credentials & Secret-Hygiene | Stufe 2 | 90 Min | curl, Bruno, SoapUI | Basic, Digest, API-Keys, `.env`, `.gitignore`, `-K`/`--netrc` |
| [M06](01-module/M06-openapi-security-schemes/README.md) | OpenAPI `securitySchemes` & kombinierte Anforderungen | Stufe 2 | 75 Min | Bruno, OpenAPI-Editor | `apiKey`, `http`, `mutualTLS`, `oauth2`, `openIdConnect`, AND/OR |
| [M07](01-module/M07-tls-custom-ca-mtls/README.md) | TLS, Custom Certificate Authorities & Mutual TLS (mTLS) | Stufe 2 | 105 Min | curl, Bruno (GUI/CLI), SoapUI | X.509, PEM/PFX, Custom CA, mTLS, `--client-cert-config` |
| [M08](01-module/M08-soap-ws-security/README.md) | SOAP WS-Security (WSS): UsernameToken, Signatur & Verschlüsselung | Stufe 2 | 120 Min | SoapUI OS 5.10 | WS-Security, Keystore/Truststore, Timestamp, XML-Signatur/Enc. |
| [M09](01-module/M09-oauth2-rfc9700-oauth21/README.md) | OAuth 2.0 vs. RFC 9700 & OAuth 2.1: Architektur & Anti-Patterns | Stufe 3 | 120 Min | Architektur, curl | RFC 6749, RFC 9700 (BCP 240), OAuth 2.1 Draft-17, PKCE S256 |
| [M10](01-module/M10-oauth-praxis-pkce-m2m/README.md) | OAuth-Praxis: Authorization Code + PKCE & Client Credentials | Stufe 3 | 135 Min | Bruno, curl, SoapUI | Keycloak / mock-oauth2-server, Token-Inheritance, Refresh |
| [M11](01-module/M11-oidc-discovery-jwks-userinfo/README.md) | OpenID Connect (OIDC): Discovery, JWKS, ID Token & `/userinfo` | Stufe 3 | 120 Min | curl, jq, Bruno | OIDC 1.0, `/.well-known/openid-configuration`, JWT, JWKS |
| [M12](01-module/M12-token-lifecycle-audits-cicd/README.md) | Token-Lebenszyklus, Sicherheits-Audits & CI/CD-Automatisierung | Stufe 3 | 120 Min | curl, Bruno CLI, GitHub Actions | RFC 7662 (Introspection), RFC 7009 (Revocation), DPoP/mTLS, `bru run` |
| [CAP](04-projekte/capstone-hybrid-order/README.md) | Abschlussprojekt: Hybride Enterprise-Auftragsintegration | Projekt | 180 Min | curl, Bruno, SoapUI | OIDC + OpenAPI REST + SOAP/WSS + automatisierter CI-Lauf |

## Repository-Struktur

- `00-setup/` — Installationsprüfung, Labor-Verifikation und `smoke-test.sh`
- `01-module/` — Zwölf nummerierte Theorie- und Walkthrough-Ordner (`M01`–`M12`)
- `02-uebungen/` — Aufgabenblätter mit gestuften Hilfestellungen (`<details>`) und Definition of Done
- `03-loesungen/` — Vollständige Musterlösungen mit kommentierten Skripten und Assertions
- `04-projekte/capstone-hybrid-order/` — Dreistündiges Abschlussprojekt inklusive Bewertungsrubrik
- `collections/bruno/` — Bruno-Workspaces im **OpenCollection-YAML-Format (`.yml`)**
- `collections/soapui/` — Versionierte SoapUI-Projektdateien (`*-soapui-project.xml`)
- `scripts/curl/` — Ausführbare, sichere Bash-Skripte (`-K`, `--netrc-file`, `--data-binary`, `jq`)
- `lab/` — Reproduzierbares Docker-Compose-Labor (`petstore3`, `go-httpbin`, `soap-service`, `keycloak`, `mock-oauth2-server`, Zertifikats-Generator)

## Weitere Dokumentation

- [CONCEPT.md](CONCEPT.md) — Didaktisches Leitkonzept & Werkzeug-Triangulation
- [LEARNING-GUIDE.md](LEARNING-GUIDE.md) — Empfohlene Lernpfade (Präsenzkurs, Selbststudium, Security-Track)
- [ROADMAP.md](ROADMAP.md) — Ausbaupfad für künftige Module
- [AGENTS.md](AGENTS.md) — Verbindliche Regeln für KI-Assistenten und Maintainer
