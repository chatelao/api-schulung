# Praxis-Schulung API-Nutzung: Bruno, SoapUI, OpenAPI, SOAP, OAuth 2.1, OIDC & `curl` (Advanced)

Willkommen im Kurs-Repository **`api-schulung`**. Dieses Curriculum vermittelt die praxisnahe Nutzung, Analyse und Absicherung moderner sowie klassischer Programmierschnittstellen (**REST/OpenAPI** und **SOAP/WSDL**):

- **Basis-Lehrgang (`M00`–`M12` + `Capstone`):** Konzipiert für Teilnehmende **ohne tiefergehende Shell- oder Netzwerk-Vorkenntnisse** — durchgängig visuell und praxisnah mit **Swagger UI**, **Bruno Desktop (OpenCollection YAML)**, **SoapUI Open Source (5.10.1)** und dem Webbrowser.
- **Advanced-Track ([advanced/](advanced/README.md)):** Alle **`curl`-**, Shell-, `jq`-, `openssl`- und `bru run`-CLI-Übungen für Teilnehmende, die Schnittstellen zusätzlich auf der Kommandozeile und in CI/CD-Pipelines automatisieren wollen.

- **Online-Lehrgang (Read the Docs):** https://api-schulung.readthedocs.io/
- **Interaktives Lernstudio (GitHub Pages):** https://chatelao.github.io/api-schulung/
- **Technischer Stand:** November 2026 (OAuth 2.0 Security BCP **RFC 9700**, **OAuth 2.1 Draft-17**, **OpenAPI 3.0 / 3.1**, **Bruno OpenCollection YAML**, **SoapUI OS 5.10.1**)

## Schnellstart

1. Starte die lokale Laborumgebung anhand der [QUICK-START.md](QUICK-START.md) (ca. 15 Minuten; inklusive kleinem Terminal-Crashkurs in [M00](00-setup/README.md)).
2. Wähle deinen Lernpfad in [LEARNING-GUIDE.md](LEARNING-GUIDE.md).
3. Beginne mit [Modul 0: Labor-Setup](00-setup/README.md) oder nutze begleitend das [Interaktive Lernstudio](https://chatelao.github.io/api-schulung/).

## Voraussetzungen

- Keine Shell- oder Netzwerkprotokoll-Vorkenntnisse für den Basis-Lehrgang erforderlich (URLs, HTTP, JSON, XML, TLS und OAuth werden Schritt für Schritt eingeführt)
- Installierte Werkzeuge: `docker` (inkl. Docker Compose), **Bruno Desktop** (v3/v4), **SoapUI Open Source 5.10.1**, moderner Webbrowser (für den Advanced-Track zusätzlich `curl`, `jq`, `openssl` und `@usebruno/cli`)

## Basis-Lehrgang (visuell mit Browser, Bruno Desktop & SoapUI OS)

| Modul | Titel | Stufe | Dauer | Primäre Werkzeuge | Kernprotokolle & Standards |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [M00](00-setup/README.md) | Labor-Setup, Terminal-Crashkurs & Smoke-Tests | Einstieg | 45 Min | Docker, Bruno Desktop, SoapUI | Lokaler Container-Stack |
| [M01](01-module/M01-http-fundament-curl/README.md) | HTTP-Fundament & erste API-Requests | Stufe 1 | 90 Min | Swagger UI, Bruno Desktop | HTTP/1.1 & HTTP/2, Verben, Header, Statuscodes, JSON |
| [M02](01-module/M02-openapi-bruno-yaml/README.md) | Swagger / OpenAPI (2.0, 3.0, 3.1) lesen & mit Bruno nutzen | Stufe 1 | 120 Min | Bruno Desktop, Browser | OpenAPI 3.0/3.1, JSON Schema, OpenCollection YAML |
| [M03](01-module/M03-soap-wsdl-soapui-curl/README.md) | SOAP 1.1/1.2 & WSDL-Verträge in SoapUI Open Source | Stufe 1 | 150 Min | SoapUI OS 5.10.1, Bruno | WSDL 1.1, XSD, SOAP 1.1 vs. 1.2, Faults |
| [M04](01-module/M04-assertions-chaining-mocking/README.md) | Assertions, Request-Chaining, Scripting & Mocking | Stufe 1 | 120 Min | Bruno Desktop, SoapUI OS | Assert-Tab, Chai-Tests, XPath, Property Transfer, MockService |
| [M05](01-module/M05-credentials-secret-hygiene/README.md) | Klassische Credentials & Secret-Hygiene | Stufe 2 | 90 Min | Bruno Desktop, SoapUI OS | Basic, Digest, API-Keys, `.env`, `.gitignore`, `secret: true` |
| [M06](01-module/M06-openapi-security-schemes/README.md) | OpenAPI `securitySchemes` & kombinierte Anforderungen | Stufe 2 | 75 Min | Bruno Desktop, OpenAPI-Editor | `apiKey`, `http`, `mutualTLS`, `oauth2`, `openIdConnect`, AND/OR |
| [M07](01-module/M07-tls-custom-ca-mtls/README.md) | TLS, Custom Certificate Authorities & Mutual TLS (mTLS) | Stufe 2 | 105 Min | Bruno Desktop, SoapUI OS | X.509, PEM/PFX/JKS, Custom CA, mTLS |
| [M08](01-module/M08-soap-ws-security/README.md) | SOAP WS-Security (WSS): UsernameToken, Signatur & Verschlüsselung | Stufe 2 | 120 Min | SoapUI OS 5.10.1 | WS-Security, Keystore/Truststore, Timestamp, XML-Signatur/Enc. |
| [M09](01-module/M09-oauth2-rfc9700-oauth21/README.md) | OAuth 2.0 vs. RFC 9700 & OAuth 2.1: Architektur & Anti-Patterns | Stufe 3 | 120 Min | Browser Debugger, Bruno | RFC 6749, RFC 9700 (BCP 240), OAuth 2.1 Draft-17, PKCE S256 |
| [M10](01-module/M10-oauth-praxis-pkce-m2m/README.md) | OAuth-Praxis: Authorization Code + PKCE & Client Credentials | Stufe 3 | 135 Min | Bruno Desktop, SoapUI OS | Keycloak / mock-oauth2-server, Token-Inheritance, Refresh |
| [M11](01-module/M11-oidc-discovery-jwks-userinfo/README.md) | OpenID Connect (OIDC): Discovery, JWKS, ID Token & `/userinfo` | Stufe 3 | 120 Min | Browser, Bruno, Lernstudio | OIDC 1.0, `/.well-known/openid-configuration`, JWT, JWKS |
| [M12](01-module/M12-token-lifecycle-audits-cicd/README.md) | Token-Lebenszyklus, Sicherheits-Audits & Automatisierung | Stufe 3 | 120 Min | Bruno Runner, GitHub Actions | RFC 7662 (Introspection), RFC 7009 (Revocation), DPoP/mTLS |
| [CAP](04-projekte/capstone-hybrid-order/README.md) | Abschlussprojekt: Hybride Enterprise-Auftragsintegration | Projekt | 180 Min | Bruno Desktop, SoapUI OS | OIDC + OpenAPI REST + mTLS + SOAP/WSS |

## Advanced-Track: Shell, `curl` & CLI-Automatisierung

Alle **`curl`-**, `jq`- und `openssl`-Übungen sowie die headless CI/CD-Automatisierung befinden sich gebündelt im Ordner [advanced/](advanced/README.md) (`A01`–`A06`, inklusive [Übungen](advanced/uebungen.md), [Musterlösungen](advanced/loesungen.md) und den 8 ausführbaren Bash-Skripten unter [scripts/curl/](scripts/curl/)).

## Repository-Struktur

- `00-setup/` — Installationsprüfung, Terminal-Crashkurs & `smoke-test.sh`
- `01-module/` — Zwölf einsteigerfreundliche Basis-Module (`M01`–`M12`)
- `02-uebungen/` & `03-loesungen/` — Basis-Aufgabenblätter und Musterlösungen (GUI-first)
- `04-projekte/capstone-hybrid-order/` — Dreistündiges Abschlussprojekt inklusive Bewertungsrubrik
- `advanced/` — Aufbaumodule `A01`–`A06` für Shell, `curl`, `jq`, `openssl` & `bru run`
- `interactive/` — Interaktives API-Lernstudio (veröffentlicht auf GitHub Pages)
- `docs/` & `mkdocs.yml` — Read-the-Docs-Lehrgang
- `collections/bruno/` & `collections/soapui/` — OpenCollection-YAML-Workspaces & SoapUI-Projekte
- `scripts/curl/` — Ausführbare, sichere Bash-Skripte für den Advanced-Track
- `lab/` — Reproduzierbares Docker-Compose-Labor

## Weitere Dokumentation

- [CONCEPT.md](CONCEPT.md) — Didaktisches Leitkonzept & Werkzeug-Triangulation
- [LEARNING-GUIDE.md](LEARNING-GUIDE.md) — Empfohlene Lernpfade
- [ROADMAP.md](ROADMAP.md) — Ausbaupfad für künftige Module
- [AGENTS.md](AGENTS.md) — Verbindliche Regeln für KI-Assistenten und Maintainer
