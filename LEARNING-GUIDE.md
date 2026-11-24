# LEARNING-GUIDE.md — Empfohlene Lernpfade

Dieses Curriculum unterstützt fünf klare Lernwege — vom **sofortigen Einstieg ganz ohne Installation** bis zum **eigenen Container-Labor & `curl`-Track**.

## Pfad A: Zero-Install-Schnupperkurs (nur Webbrowser, ca. 4 Stunden)

Ideal, um ohne Admin-Rechte oder Software-Installation sofort APIs zu verstehen:
- **M00 + M01:** `https://petstore3.swagger.io/` & `https://httpbin.org/` (Swagger Web UIs direkt im Browser)
- **M05 (Basis) + M06:** Basic/Bearer Auth in der HTTPBin Swagger UI + OpenAPI Security Tester im [Interaktiven Lernstudio](https://chatelao.github.io/api-schulung/)
- **M07 (Einstieg) + M09 + M11:** `https://badssl.com/`, PKCE & JWT-Inspektor im Lernstudio, `https://demo.duendesoftware.com/.well-known/openid-configuration`

## Pfad B: 4-Tages-Präsenzschulung (Basis-Lehrgang ohne Shell-Ballast)

| Tag | Fokus | Module | Netto-Zeit |
| :--- | :--- | :--- | :--- |
| **Tag 1** | Zero-Install Swagger UI & Desktop-Clients | M00, M01, M02, M03 | 380 Min |
| **Tag 2** | Automatisierung, Secret-Hygiene & TLS | M04, M05, M06, M07 | 390 Min |
| **Tag 3** | SOAP-Sicherheit & OAuth-2.1-Architektur *(Container aus A00 für M08/M10)* | M08, M09, M10 | 375 Min |
| **Tag 4** | OIDC, Token-Lifecycle & Capstone | M11, M12, Capstone | 420 Min |

## Pfad C: 4-Wochen-Selbststudium (mit dem Interaktiven Lernstudio)

Begleitend zum Handbuch auf **Read the Docs** empfiehlt sich das **Interaktive Lernstudio auf GitHub Pages** (`https://chatelao.github.io/api-schulung/`) für Fortschritts-Tracking, Checkpoints (`CP-0` bis `CP-3`), interaktive Protokoll-Labs, Flashcards und das Abschluss-Quiz:
- **Woche 1 (ohne Container möglich):** M00 → M01 → M02 → M03 → M04
- **Woche 2 (M05–M07 Einstieg ohne Container; M07 mTLS & M08 mit `A00`):** M05 → M06 → M07 → M08
- **Woche 3:** M09 → M10 → M11
- **Woche 4:** M12 → Capstone-Projekt (`04-projekte/capstone-hybrid-order/`)

## Pfad D: Fokus-Track «API Security & OAuth 2.1»

1. **M05 → M06 → M07** (Secret-Hygiene, OpenAPI `securitySchemes`, `badssl.com`, mTLS mit `A00`)
2. **M09 → M10 → M11 → M12** (OAuth 2.1, PKCE, OIDC Discovery/JWKS, Introspection/Revocation & Security-Audits)

## Pfad E: Advanced-Track «Eigenes Docker-Labor, Shell, `curl` & CI/CD»

Für Teilnehmende, die eigene Server-Container betreiben und Schnittstellen per Terminal (`curl`, `jq`, `openssl`) sowie `@usebruno/cli` (`bru run`) automatisieren möchten:
- [Advanced A00–A06](advanced/README.md) inklusive [A00: Eigenes Docker-Labor](advanced/A00-lokales-labor-docker.md), [Advanced-Übungen](advanced/uebungen.md) und [Musterlösungen](advanced/loesungen.md).
