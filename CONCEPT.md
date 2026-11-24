# CONCEPT.md — Didaktisches Leitkonzept und Architektur-Entscheidungen

## 1. Zielgruppe und Lernziel-Taxonomie

Die Schulung richtet sich an Softwareentwicklerinnen und Softwareentwickler, QA- und Test-Engineers, Systemintegratoren sowie technisch orientierte Business-Analysten.

**Wichtige Zielgruppen-Annahme:** Für den Basis-Lehrgang (`M01`–`M12`) werden **keine vertieften Shell- oder Netzwerkprotokoll-Vorkenntnisse** vorausgesetzt. Alle Protokollkonzepte (URL, HTTP-Header, Statuscodes, JSON/XML, TLS, OAuth 2.1, OIDC) werden anschaulich von Grund auf eingeführt und mit grafischen Client-Werkzeugen (**Swagger UI**, **Bruno Desktop**, **SoapUI Open Source 5.10.1**, Webbrowser) eingeübt.

Für fortgeschrittene Teilnehmende und DevOps-/CI-Rollen bündelt der **[Advanced-Track (`advanced/`)](advanced/README.md)** alle **`curl`**, `jq`, `openssl` und `@usebruno/cli` (`bru run`) Übungen auf der Kommandozeile.

Das Curriculum folgt einer klaren Kompetenzprogression:

1. **Stufe 1 — Grundlagen (M01–M04):** Visuelles Protokollverständnis (HTTP, OpenAPI, WSDL/SOAP), automatisierte Assertions, Request-Chaining und Mocking in Bruno Desktop & SoapUI OS.
2. **Stufe 2 — Transport- & Nachrichtensicherheit (M05–M08):** Secret-Hygiene (`secret: true`), OpenAPI-`securitySchemes`, X.509/Custom-CA/mTLS sowie nachrichtenbasierte SOAP-Sicherheit (WS-Security).
3. **Stufe 3 — Moderne Identitäts- & Autorisierungsarchitekturen (M09–M12):** OAuth 2.0 vs. RFC 9700 / OAuth 2.1, PKCE, Client Credentials, OIDC Discovery/JWKS, Token-Lebenszyklus und Security-Audits.
4. **Advanced-Track (`A01`–`A06`):** Kommandozeilen-Beherrschung mit `curl`, `jq`, `openssl` und headless `bru run` in CI/CD-Pipelines.

## 2. Das Prinzip der Werkzeug-Triangulation & Dual-Publishing

| Werkzeug / Plattform | Didaktische Rolle | Einsatzbereich |
| :--- | :--- | :--- |
| **Bruno Desktop (v3/v4)** | Git-nativer REST/OpenAPI-Client (OpenCollection YAML) | Basis-Lehrgang `M01`–`M12` + `Capstone` |
| **SoapUI OS 5.10.1** | Streng typisierter XML-/WSDL- & WS-Security-Client | Basis-Lehrgang `M03`, `M04`, `M07`, `M08`, `M10`, `Capstone` |
| **`curl` + `jq` + `bru`** | Unverfälschte Protokoll- & CI-Kontrollinstanz auf der Shell | **Advanced-Track (`A01`–`A06`)** & GitHub Actions |
| **Read the Docs** | Vollständiges Nachschlage- und Lehrbuch (MkDocs Material) | `https://api-schulung.readthedocs.io/` |
| **GitHub Pages** | Interaktives Lernstudio (Fortschritt, Checkpoints, Labs, Flashcards, Mock Exam) | `https://chatelao.github.io/api-schulung/` |
