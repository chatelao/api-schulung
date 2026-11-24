# Praxis-Schulung API-Nutzung: curl, Bruno, SoapUI, OpenAPI, SOAP, OAuth 2.1 & OIDC

Willkommen im Kurs-Repository **`api-schulung`**. Dieses Curriculum vermittelt die praxisnahe Nutzung, Analyse, Absicherung und Automatisierung moderner sowie klassischer Programmierschnittstellen (**REST/OpenAPI** und **SOAP/WSDL**) mithilfe der drei komplementären Werkzeuge **`curl`**, **Bruno (OpenCollection YAML)** und **SoapUI Open Source (5.10.1)**.

- **Gesamtumfang:** 26,5 Stunden Netto-Lernzeit (1'590 Minuten)
- **Format:** 4-Tages-Präsenzschulung oder 4-Wochen-Selbststudium
- **Technischer Stand:** November 2026 (OAuth 2.0 Security BCP **RFC 9700**, **OAuth 2.1 Draft-17**, **OpenAPI 3.0 / 3.1**, **Bruno OpenCollection YAML**, **SoapUI OS 5.10.1**)

## Schnellstart

1. Starte die lokale Laborumgebung und prüfe alle Werkzeuge anhand der [QUICK-START.md](quick-start.md) (ca. 15 Minuten).
2. Wähle deinen Lernpfad in [LEARNING-GUIDE.md](learning-guide.md).
3. Beginne mit [Modul 0: Labor-Setup & Smoke-Tests](setup/m00-setup.md).

## Voraussetzungen

- Grundlegende Vertrautheit mit der Kommandozeile (Bash/Zsh/PowerShell)
- Grundkenntnisse in JSON und XML sowie elementaren Web-Begriffen (URL, HTTP-Statuscodes, TLS)
- Installierte Werkzeuge: `docker` (inkl. Docker Compose), `curl`, `jq`, **Bruno Desktop** (v3/v4) + `@usebruno/cli` (`bru`), **SoapUI Open Source 5.10.1**, `openssl` / `keytool`

## Modul-Übersicht (1'590 Minuten / 26,5 Stunden)

| Modul | Titel | Stufe | Dauer | Primäre Werkzeuge | Kernprotokolle & Standards |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [M00](setup/m00-setup.md) | Labor-Setup, Werkzeug-Check & Smoke-Tests | Einstieg | 45 Min | Docker, curl, Bruno, SoapUI | Lokaler Container-Stack, CLI-Checks |
| [M01](module/M01.md) | HTTP-Fundament & curl ohne Magie | Stufe 1 | 90 Min | curl, jq | HTTP/1.1 & HTTP/2, Verben, Header, Statuscodes, JSON |
| [M02](module/M02.md) | Swagger / OpenAPI (2.0, 3.0, 3.1) lesen & mit Bruno nutzen | Stufe 1 | 120 Min | Bruno (YAML & CLI), curl | OpenAPI 3.0/3.1, JSON Schema, OpenCollection YAML |
| [M03](module/M03.md) | SOAP 1.1/1.2 & WSDL-Verträge in SoapUI und curl | Stufe 1 | 150 Min | SoapUI OS 5.10, curl | WSDL 1.1, XSD, SOAP 1.1 vs. 1.2, Faults |
| [M04](module/M04.md) | Assertions, Request-Chaining, Scripting & Mocking | Stufe 1 | 120 Min | Bruno, SoapUI OS | Chai-Tests, XPath/XQuery, Property Transfer, MockService |
| [M05](module/M05.md) | Klassische Credentials & Secret-Hygiene | Stufe 2 | 90 Min | curl, Bruno, SoapUI | Basic, Digest, API-Keys, `.env`, `.gitignore`, `-K`/`--netrc` |
| [M06](module/M06.md) | OpenAPI `securitySchemes` & kombinierte Anforderungen | Stufe 2 | 75 Min | Bruno, OpenAPI-Editor | `apiKey`, `http`, `mutualTLS`, `oauth2`, `openIdConnect`, AND/OR |
| [M07](module/M07.md) | TLS, Custom Certificate Authorities & Mutual TLS (mTLS) | Stufe 2 | 105 Min | curl, Bruno (GUI/CLI), SoapUI | X.509, PEM/PFX, Custom CA, mTLS, `--client-cert-config` |
| [M08](module/M08.md) | SOAP WS-Security (WSS): UsernameToken, Signatur & Verschlüsselung | Stufe 2 | 120 Min | SoapUI OS 5.10 | WS-Security, Keystore/Truststore, Timestamp, XML-Signatur/Enc. |
| [M09](module/M09.md) | OAuth 2.0 vs. RFC 9700 & OAuth 2.1: Architektur & Anti-Patterns | Stufe 3 | 120 Min | Architektur, curl | RFC 6749, RFC 9700 (BCP 240), OAuth 2.1 Draft-17, PKCE S256 |
| [M10](module/M10.md) | OAuth-Praxis: Authorization Code + PKCE & Client Credentials | Stufe 3 | 135 Min | Bruno, curl, SoapUI | Keycloak / mock-oauth2-server, Token-Inheritance, Refresh |
| [M11](module/M11.md) | OpenID Connect (OIDC): Discovery, JWKS, ID Token & `/userinfo` | Stufe 3 | 120 Min | curl, jq, Bruno | OIDC 1.0, `/.well-known/openid-configuration`, JWT, JWKS |
| [M12](module/M12.md) | Token-Lebenszyklus, Sicherheits-Audits & CI/CD-Automatisierung | Stufe 3 | 120 Min | curl, Bruno CLI, GitHub Actions | RFC 7662 (Introspection), RFC 7009 (Revocation), DPoP/mTLS, `bru run` |
| [CAP](capstone/index.md) | Abschlussprojekt: Hybride Enterprise-Auftragsintegration | Projekt | 180 Min | curl, Bruno, SoapUI | OIDC + OpenAPI REST + SOAP/WSS + automatisierter CI-Lauf |

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

- [CONCEPT.md](concept.md) — Didaktisches Leitkonzept & Werkzeug-Triangulation
- [LEARNING-GUIDE.md](learning-guide.md) — Empfohlene Lernpfade (Präsenzkurs, Selbststudium, Security-Track)
- [ROADMAP.md](roadmap.md) — Ausbaupfad für künftige Module
- [AGENTS.md](agents.md) — Verbindliche Regeln für KI-Assistenten und Maintainer
