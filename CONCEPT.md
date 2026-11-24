# CONCEPT.md — Didaktisches Leitkonzept und Architektur-Entscheidungen

## 1. Zielgruppe und Lernziel-Taxonomie

Die Schulung richtet sich an Softwareentwicklerinnen und Softwareentwickler, QA- und Test-Engineers, Systemintegratoren sowie technisch orientierte Business-Analysten.

**Wichtige Zielgruppen-Annahme:** Für den Basis-Einstieg werden **keine Shell- oder Netzwerkprotokoll-Vorkenntnisse** und **kein lokaler Container-Stack** vorausgesetzt. Der niedrigschwellige Start gelingt direkt im Browser über **öffentliche Endpunkte mit eingebauter Swagger Web UI** (`https://petstore3.swagger.io/`, `https://httpbin.org/`). Erst danach folgen die Desktop-Clients (**Bruno Desktop**, **SoapUI Open Source 5.10.1**).

Für fortgeschrittene Teilnehmende, Offline-/Security-Labs und DevOps-/CI-Rollen bündelt der **[Advanced-Track (`advanced/`)](advanced/README.md)** sowohl das **eigene 6-Container-Docker-Labor (`A00`)** als auch alle **`curl`**, `jq`, `openssl` und `@usebruno/cli` (`bru run`) Übungen auf der Kommandozeile (`A01`–`A06`).

Das Curriculum folgt einer klaren Progression:

1. **Sofort-Einstieg ohne Installation (`M00`–`M01`):** API-Grundlagen direkt im Browser über öffentliche **Swagger Web UIs** erleben (*Try it out*).
2. **Stufe 1 — Grundlagen mit Desktop-Clients (`M02`–`M04`):** OpenAPI & Collections in Bruno Desktop (`public`-Environment), SOAP/WSDL gegen öffentliche Dienste in SoapUI OS, Assertions & Mocking.
3. **Stufe 2 — Transport- & Nachrichtensicherheit (`M05`–`M08`):** Secret-Hygiene, OpenAPI-`securitySchemes`, TLS-Fehlerbilder über `badssl.com` sowie vertiefende mTLS- und WS-Security-Labs mit dem Container-Labor (`A00`).
4. **Stufe 3 — Moderne Identitäts- & Autorisierungsarchitekturen (`M09`–`M12`):** OAuth 2.0 vs. RFC 9700 / OAuth 2.1, OIDC Discovery/JWKS (Browser + Duende Demo), PKCE & Token-Lifecycle (mit Container-Labor `A00`).
5. **Advanced-Track (`A00`–`A06`):** Eigenes Docker-Labor (`A00`) sowie Kommandozeilen-Beherrschung mit `curl`, `jq`, `openssl` und headless `bru run` in CI/CD-Pipelines.

## 2. Das Prinzip der Werkzeug-Triangulation & Dual-Publishing

| Werkzeug / Plattform | Didaktische Rolle | Einsatzbereich |
| :--- | :--- | :--- |
| **Swagger Web UI (Browser)** | Null-Installation-Einstieg direkt am API-Endpunkt | `M00`, `M01`, `M02`, `M05`, `M06` (`petstore3.swagger.io`, `httpbin.org`) |
| **Bruno Desktop (v3/v4)** | Git-nativer REST/OpenAPI-Client (OpenCollection YAML, `public` & `local`) | Basis-Lehrgang `M02`–`M12` + `Capstone` |
| **SoapUI OS 5.10.1** | Streng typisierter XML-/WSDL- & WS-Security-Client | Basis-Lehrgang `M03`, `M04`, `M07`, `M08`, `M10`, `Capstone` |
| **Eigenes Docker-Labor (`A00`) & `curl` (`A01`–`A06`)** | Reproduzierbare Container-Security (Keycloak, mTLS, WSS) & Shell-Automatisierung | **Advanced-Track (`A00`–`A06`)**, Sicherheitsvertiefung & GitHub Actions |
| **Read the Docs** | Vollständiges Nachschlage- und Lehrbuch (MkDocs Material) | `https://api-schulung.readthedocs.io/` |
| **GitHub Pages** | Interaktives Lernstudio (Fortschritt, Checkpoints, Labs, Flashcards, Mock Exam) | `https://chatelao.github.io/api-schulung/` |
