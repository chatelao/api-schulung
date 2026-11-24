# LEARNING-GUIDE.md — Empfohlene Lernpfade

Dieses Curriculum unterstützt vier unterschiedliche Lernformate — inklusive eines sanften Einstiegs ohne Shell-Vorkenntnisse sowie eines dedizierten Advanced-Tracks für `curl` & CLI-Automatisierung.

## Pfad A: 4-Tages-Präsenzschulung (Basis-Lehrgang ohne Shell-Ballast)

| Tag | Fokus | Module | Netto-Zeit |
| :--- | :--- | :--- | :--- |
| **Tag 1** | Setup & Protokoll-Fundament (GUI-first) | M00, M01, M02, M03 | 405 Min |
| **Tag 2** | Automatisierung & Credential-Hygiene | M04, M05, M06, M07 | 390 Min |
| **Tag 3** | SOAP-Sicherheit & OAuth-2.1-Architektur | M08, M09, M10 | 375 Min |
| **Tag 4** | OIDC, Token-Lifecycle & Capstone | M11, M12, Capstone | 420 Min |

## Pfad B: 4-Wochen-Selbststudium (mit dem Interaktiven Lernstudio)

Begleitend zum Handbuch auf **Read the Docs** empfiehlt sich das **Interaktive Lernstudio auf GitHub Pages** (`https://chatelao.github.io/api-schulung/`) für Fortschritts-Tracking, Checkpoints (`CP-0` bis `CP-3`), interaktive Protokoll-Labs, Flashcards und das Abschluss-Quiz:
- **Woche 1:** M00 → M01 → M02 → M03 → M04
- **Woche 2:** M05 → M06 → M07 → M08
- **Woche 3:** M09 → M10 → M11
- **Woche 4:** M12 → Capstone-Projekt (`04-projekte/capstone-hybrid-order/`)

## Pfad C: Fokus-Track «API Security & OAuth 2.1»

1. **M00** (Labor-Setup & Zertifikate)
2. **M05 → M06 → M07** (Secret-Hygiene, OpenAPI `securitySchemes`, Custom CA & mTLS)
3. **M09 → M10 → M11 → M12** (OAuth 2.1, PKCE, OIDC, Introspection/Revocation & Security-Audits)

## Pfad D: Advanced-Track «Shell, `curl` & CI/CD-Automatisierung»

Für Teilnehmende, die nach dem Basis-Lehrgang alle Schnittstellen auch per Terminal (`curl`, `jq`, `openssl`) und `@usebruno/cli` (`bru run`) automatisieren möchten:
- [Advanced A01–A06](advanced/README.md) inklusive [Advanced-Übungen](advanced/uebungen.md) und [Musterlösungen](advanced/loesungen.md).
