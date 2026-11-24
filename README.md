# Praxis-Schulung API-Nutzung: Swagger Web UI, Bruno, SoapUI, OAuth 2.1, OIDC & `curl` (Advanced)

Willkommen im Kurs-Repository **`api-schulung`**. Dieses Curriculum vermittelt die praxisnahe Nutzung, Analyse und Absicherung moderner sowie klassischer Programmierschnittstellen (**REST/OpenAPI** und **SOAP/WSDL**) mit möglichst geringem Installationsaufwand:

- **Sofort-Einstieg ohne Installation (`M00`–`M02` + Lernstudio):** Starte **direkt im Webbrowser** über öffentliche Endpunkte mit eingebauter **Swagger Web UI** (`https://petstore3.swagger.io/`, `https://httpbin.org/`) sowie das **Interaktive Lernstudio** — ganz ohne Docker, ohne Shell und noch bevor du ein Programm installieren musst.
- **Basis-Lehrgang GUI-first (`M02`–`M12` + `Capstone`):** Konzipiert für Teilnehmende **ohne Shell- oder Netzwerk-Vorkenntnisse** mit **Bruno Desktop (OpenCollection YAML)** und **SoapUI Open Source (5.10.1)**. Öffentliche Endpunkte (`public`-Environment, Duende OIDC Demo, BadSSL, öffentlicher WSDL-Service) decken den Einstieg ab.
- **Advanced-Track ([advanced/](advanced/README.md)):** Enthält unser **eigenes 6-Container-Docker-Labor (`A00`)** für Offline-, mTLS-, WS-Security- und Keycloak-Szenarien sowie alle **`curl`-**, `jq`-, `openssl`- und `bru run`-CLI-Übungen (`A01`–`A06`).

- **Online-Lehrgang (Read the Docs):** https://api-schulung.readthedocs.io/
- **Interaktives Lernstudio (GitHub Pages):** https://chatelao.github.io/api-schulung/
- **Technischer Stand:** November 2026 (OAuth 2.0 Security BCP **RFC 9700**, **OAuth 2.1 Draft-17**, **OpenAPI 3.0 / 3.1**, **Bruno OpenCollection YAML**, **SoapUI OS 5.10.1**)

## Schnellstart

1. **0 Minuten Installation:** Öffne [Modul 0: Zero-Install-Einstieg](00-setup/README.md) oder [QUICK-START.md](QUICK-START.md) und klicke direkt in den öffentlichen Swagger Web UIs (`https://petstore3.swagger.io/`, `https://httpbin.org/`).
2. **Client-GUI (ohne Container):** Installiere bei Bedarf ab `M02` **Bruno Desktop** und ab `M03` **SoapUI OS 5.10.1**.
3. **Eigenes Docker-Labor & Shell (`Advanced`):** Starte erst für fortgeschrittene Security-Labs (`M08`, `M10`, `M12`, `Capstone`) oder CLI-Übungen unseren Container-Stack anhand von [Advanced A00](advanced/A00-lokales-labor-docker.md).

## Basis-Lehrgang (Zero-Install Swagger UI → Bruno Desktop & SoapUI OS)

| Modul | Titel | Stufe | Dauer | Primäre Werkzeuge | Kernprotokolle & Standards |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [M00](00-setup/README.md) | Zero-Install-Einstieg (Swagger Web UI) & Werkzeug-Überblick | Einstieg | 20 Min | Webbrowser (Swagger UI) | Öffentliche Test-APIs ohne Docker |
| [M01](01-module/M01-http-fundament-curl/README.md) | HTTP-Fundament & erste API-Requests (Swagger Web UI) | Stufe 1 | 90 Min | Swagger Web UI (`petstore3.swagger.io`, `httpbin.org`), optional Bruno | HTTP/1.1 & HTTP/2, Verben, Header, Statuscodes, JSON |
| [M02](01-module/M02-openapi-bruno-yaml/README.md) | Swagger / OpenAPI (2.0, 3.0, 3.1) lesen & mit Bruno nutzen | Stufe 1 | 120 Min | Swagger UI, Bruno Desktop (`public`-Env) | OpenAPI 3.0/3.1, JSON Schema, OpenCollection YAML |
| [M03](01-module/M03-soap-wsdl-soapui-curl/README.md) | SOAP 1.1/1.2 & WSDL-Verträge in SoapUI Open Source | Stufe 1 | 150 Min | SoapUI OS 5.10.1 (öffentlicher WSDL / optional `A00`) | WSDL 1.1, XSD, SOAP 1.1 vs. 1.2, Faults |
| [M04](01-module/M04-assertions-chaining-mocking/README.md) | Assertions, Request-Chaining, Scripting & Mocking | Stufe 1 | 120 Min | Bruno Desktop, SoapUI OS | Assert-Tab, Chai-Tests, XPath, Property Transfer, MockService |
| [M05](01-module/M05-credentials-secret-hygiene/README.md) | Klassische Credentials & Secret-Hygiene | Stufe 2 | 90 Min | Swagger Web UI (`httpbin.org`), Bruno Desktop, SoapUI | Basic, API-Keys, Bearer, `secret: true`, `.gitignore` |
| [M06](01-module/M06-openapi-security-schemes/README.md) | OpenAPI `securitySchemes` & kombinierte Anforderungen | Stufe 2 | 75 Min | Lernstudio, Bruno Desktop, OpenAPI-Spec | `apiKey`, `http`, `mutualTLS`, `oauth2`, `openIdConnect`, AND/OR |
| [M07](01-module/M07-tls-custom-ca-mtls/README.md) | TLS, Custom Certificate Authorities & Mutual TLS (mTLS) | Stufe 2 | 105 Min | Browser (`badssl.com`), Bruno Desktop, SoapUI (`A00` für mTLS) | X.509, PEM/PFX/JKS, Custom CA, mTLS |
| [M08](01-module/M08-soap-ws-security/README.md) | SOAP WS-Security (WSS): UsernameToken, Signatur & Verschlüsselung | Stufe 2 | 120 Min | SoapUI OS 5.10.1 + eigenes Labor (`A00`) | WS-Security, Keystore/Truststore, Timestamp, XML-Signatur/Enc. |
| [M09](01-module/M09-oauth2-rfc9700-oauth21/README.md) | OAuth 2.0 vs. RFC 9700 & OAuth 2.1: Architektur & Anti-Patterns | Stufe 3 | 120 Min | Browser Debugger, Lernstudio, Bruno | RFC 6749, RFC 9700 (BCP 240), OAuth 2.1 Draft-17, PKCE S256 |
| [M10](01-module/M10-oauth-praxis-pkce-m2m/README.md) | OAuth-Praxis: Authorization Code + PKCE & Client Credentials | Stufe 3 | 135 Min | Bruno Desktop, SoapUI OS + eigenes Labor (`A00`) | Keycloak / mock-oauth2-server, Token-Inheritance, Refresh |
| [M11](01-module/M11-oidc-discovery-jwks-userinfo/README.md) | OpenID Connect (OIDC): Discovery, JWKS, ID Token & `/userinfo` | Stufe 3 | 120 Min | Browser (`demo.duendesoftware.com`), Lernstudio, Bruno | OIDC 1.0, `/.well-known/openid-configuration`, JWT, JWKS |
| [M12](01-module/M12-token-lifecycle-audits-cicd/README.md) | Token-Lebenszyklus, Sicherheits-Audits & Automatisierung | Stufe 3 | 120 Min | Bruno Runner + eigenes Labor (`A00`), GitHub Actions | RFC 7662 (Introspection), RFC 7009 (Revocation), DPoP/mTLS |
| [CAP](04-projekte/capstone-hybrid-order/README.md) | Abschlussprojekt: Hybride Enterprise-Auftragsintegration | Projekt | 180 Min | Bruno Desktop, SoapUI OS + eigenes Labor (`A00`) | OIDC + OpenAPI REST + mTLS + SOAP/WSS |

## Advanced-Track: Eigenes Docker-Labor (`A00`), Shell, `curl` & CLI (`A01`–`A06`)

Das lokale 6-Container-Docker-Labor (`lab/docker-compose.yml`) sowie sämtliche **`curl`-**, `jq`- und `openssl`-Übungen befinden sich gebündelt im Ordner [advanced/](advanced/README.md) (`A00`–`A06`, inklusive [Übungen](advanced/uebungen.md), [Musterlösungen](advanced/loesungen.md) und den 8 ausführbaren Bash-Skripten unter [scripts/curl/](scripts/curl/)).

## Repository-Struktur

- `00-setup/` — Zero-Install-Einstieg (Swagger Web UI) & `smoke-test.sh` (für `A00`)
- `01-module/` — Zwölf einsteigerfreundliche Basis-Module (`M01`–`M12`)
- `02-uebungen/` & `03-loesungen/` — Basis-Aufgabenblätter und Musterlösungen (Swagger UI / GUI-first)
- `04-projekte/capstone-hybrid-order/` — Dreistündiges Abschlussprojekt inklusive Bewertungsrubrik
- `advanced/` — Eigenes Docker-Labor (`A00`) sowie Aufbaumodule `A01`–`A06` für Shell, `curl`, `jq`, `openssl` & `bru run`
- `interactive/` — Interaktives API-Lernstudio (veröffentlicht auf GitHub Pages)
- `docs/` & `mkdocs.yml` — Read-the-Docs-Lehrgang
- `collections/bruno/` & `collections/soapui/` — OpenCollection-YAML-Workspaces (`public` & `local`) & SoapUI-Projekte
- `scripts/curl/` & `lab/` — Reproduzierbares Docker-Compose-Labor & Bash-Skripte für den Advanced-Track
