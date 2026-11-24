# Praxis-Schulung API-Nutzung: Bruno, SoapUI, OpenAPI, SOAP, OAuth 2.1, OIDC & `curl` (Advanced)

Willkommen im Kurs-Repository **`api-schulung`**. Dieses Curriculum vermittelt die praxisnahe Nutzung, Analyse und Absicherung moderner sowie klassischer Programmierschnittstellen (**REST/OpenAPI** und **SOAP/WSDL**):

- **Basis-Lehrgang (`M00`–`M12` + `Capstone`):** Konzipiert für Teilnehmende **ohne tiefergehende Shell- oder Netzwerk-Vorkenntnisse** — durchgängig visuell und praxisnah mit **Swagger UI**, **Bruno Desktop (OpenCollection YAML)**, **SoapUI Open Source (5.10.1)** und dem Webbrowser.
- **Advanced-Track ([advanced/](advanced/index.md)):** Alle **`curl`-**, Shell-, `jq`-, `openssl`- und `bru run`-CLI-Übungen für Teilnehmende, die Schnittstellen zusätzlich auf der Kommandozeile und in CI/CD-Pipelines automatisieren wollen.

- **Online-Lehrgang (Read the Docs):** https://api-schulung.readthedocs.io/
- **Interaktives Lernstudio (GitHub Pages):** https://chatelao.github.io/api-schulung/
- **Technischer Stand:** November 2026 (OAuth 2.0 Security BCP **RFC 9700**, **OAuth 2.1 Draft-17**, **OpenAPI 3.0 / 3.1**, **Bruno OpenCollection YAML**, **SoapUI OS 5.10.1**)

## Schnellstart

1. Starte die lokale Laborumgebung anhand der [QUICK-START.md](quick-start.md) (ca. 15 Minuten; inklusive kleinem Terminal-Crashkurs in [M00](setup/m00-setup.md)).
2. Wähle deinen Lernpfad in [LEARNING-GUIDE.md](learning-guide.md).
3. Beginne mit [Modul 0: Labor-Setup](setup/m00-setup.md) oder nutze begleitend das [Interaktive Lernstudio](https://chatelao.github.io/api-schulung/).

## Voraussetzungen

- Keine Shell- oder Netzwerkprotokoll-Vorkenntnisse für den Basis-Lehrgang erforderlich (URLs, HTTP, JSON, XML, TLS und OAuth werden Schritt für Schritt eingeführt)
- Installierte Werkzeuge: `docker` (inkl. Docker Compose), **Bruno Desktop** (v3/v4), **SoapUI Open Source 5.10.1**, moderner Webbrowser (für den Advanced-Track zusätzlich `curl`, `jq`, `openssl` und `@usebruno/cli`)

## Basis-Lehrgang (visuell mit Browser, Bruno Desktop & SoapUI OS)

| Modul | Titel | Stufe | Dauer | Primäre Werkzeuge | Kernprotokolle & Standards |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [M00](setup/m00-setup.md) | Labor-Setup, Terminal-Crashkurs & Smoke-Tests | Einstieg | 45 Min | Docker, Bruno Desktop, SoapUI | Lokaler Container-Stack |
| [M01](module/M01.md) | HTTP-Fundament & erste API-Requests | Stufe 1 | 90 Min | Swagger UI, Bruno Desktop | HTTP/1.1 & HTTP/2, Verben, Header, Statuscodes, JSON |
| [M02](module/M02.md) | Swagger / OpenAPI (2.0, 3.0, 3.1) lesen & mit Bruno nutzen | Stufe 1 | 120 Min | Bruno Desktop, Browser | OpenAPI 3.0/3.1, JSON Schema, OpenCollection YAML |
| [M03](module/M03.md) | SOAP 1.1/1.2 & WSDL-Verträge in SoapUI Open Source | Stufe 1 | 150 Min | SoapUI OS 5.10.1, Bruno | WSDL 1.1, XSD, SOAP 1.1 vs. 1.2, Faults |
| [M04](module/M04.md) | Assertions, Request-Chaining, Scripting & Mocking | Stufe 1 | 120 Min | Bruno Desktop, SoapUI OS | Assert-Tab, Chai-Tests, XPath, Property Transfer, MockService |
| [M05](module/M05.md) | Klassische Credentials & Secret-Hygiene | Stufe 2 | 90 Min | Bruno Desktop, SoapUI OS | Basic, Digest, API-Keys, `.env`, `.gitignore`, `secret: true` |
| [M06](module/M06.md) | OpenAPI `securitySchemes` & kombinierte Anforderungen | Stufe 2 | 75 Min | Bruno Desktop, OpenAPI-Editor | `apiKey`, `http`, `mutualTLS`, `oauth2`, `openIdConnect`, AND/OR |
| [M07](module/M07.md) | TLS, Custom Certificate Authorities & Mutual TLS (mTLS) | Stufe 2 | 105 Min | Bruno Desktop, SoapUI OS | X.509, PEM/PFX/JKS, Custom CA, mTLS |
| [M08](module/M08.md) | SOAP WS-Security (WSS): UsernameToken, Signatur & Verschlüsselung | Stufe 2 | 120 Min | SoapUI OS 5.10.1 | WS-Security, Keystore/Truststore, Timestamp, XML-Signatur/Enc. |
| [M09](module/M09.md) | OAuth 2.0 vs. RFC 9700 & OAuth 2.1: Architektur & Anti-Patterns | Stufe 3 | 120 Min | Browser Debugger, Bruno | RFC 6749, RFC 9700 (BCP 240), OAuth 2.1 Draft-17, PKCE S256 |
| [M10](module/M10.md) | OAuth-Praxis: Authorization Code + PKCE & Client Credentials | Stufe 3 | 135 Min | Bruno Desktop, SoapUI OS | Keycloak / mock-oauth2-server, Token-Inheritance, Refresh |
| [M11](module/M11.md) | OpenID Connect (OIDC): Discovery, JWKS, ID Token & `/userinfo` | Stufe 3 | 120 Min | Browser, Bruno, Lernstudio | OIDC 1.0, `/.well-known/openid-configuration`, JWT, JWKS |
| [M12](module/M12.md) | Token-Lebenszyklus, Sicherheits-Audits & Automatisierung | Stufe 3 | 120 Min | Bruno Runner, GitHub Actions | RFC 7662 (Introspection), RFC 7009 (Revocation), DPoP/mTLS |
| [CAP](capstone/index.md) | Abschlussprojekt: Hybride Enterprise-Auftragsintegration | Projekt | 180 Min | Bruno Desktop, SoapUI OS | OIDC + OpenAPI REST + mTLS + SOAP/WSS |

## Advanced-Track: Shell, `curl` & CLI-Automatisierung

Alle **`curl`-**, `jq`- und `openssl`-Übungen sowie die headless CI/CD-Automatisierung befinden sich gebündelt im Ordner [advanced/](advanced/index.md) (`A01`–`A06`, inklusive [Übungen](advanced/uebungen.md), [Musterlösungen](advanced/loesungen.md) und den 8 ausführbaren Bash-Skripten unter [scripts/curl/](https://github.com/chatelao/api-schulung/blob/main/scripts/curl)).

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

- [CONCEPT.md](concept.md) — Didaktisches Leitkonzept & Werkzeug-Triangulation
- [LEARNING-GUIDE.md](learning-guide.md) — Empfohlene Lernpfade
- [ROADMAP.md](roadmap.md) — Ausbaupfad für künftige Module
- [AGENTS.md](agents.md) — Verbindliche Regeln für KI-Assistenten und Maintainer
