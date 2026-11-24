# LEARNING-GUIDE.md — Empfohlene Lernpfade

Dieses Curriculum ist modular aufgebaut und unterstützt drei unterschiedliche Lernformate.

## Pfad A: 4-Tages-Präsenzschulung (26,5 Stunden Netto-Lernzeit)

| Tag | Fokus | Module | Netto-Zeit |
| :--- | :--- | :--- | :--- |
| **Tag 1** | Setup & Protokoll-Fundament | M00, M01, M02, M03 | 405 Min (6,75 h) |
| **Tag 2** | Automatisierung & Credential-Hygiene | M04, M05, M06, M07 | 390 Min (6,50 h) |
| **Tag 3** | SOAP-Sicherheit & OAuth-2.1-Architektur | M08, M09, M10 | 375 Min (6,25 h) |
| **Tag 4** | OIDC, Token-Lifecycle, CI/CD & Capstone | M11, M12, Capstone | 420 Min (7,00 h) |

## Pfad B: 4-Wochen-Selbststudium (ca. 6,5 Stunden/Woche)

- **Woche 1 (Stufe 1 — Grundlagen):** M00 → M01 → M02 → M03 → M04
- **Woche 2 (Stufe 2 — Sicherheit):** M05 → M06 → M07 → M08
- **Woche 3 (Stufe 3 — OAuth 2.1 & OIDC):** M09 → M10 → M11
- **Woche 4 (Automatisierung & Abschluss):** M12 → Capstone-Projekt (`04-projekte/capstone-hybrid-order/`)

## Pfad C: Fokus-Track «API Security & OAuth 2.1» (ca. 12 Stunden)

Für Teilnehmende, die bereits sicher mit `curl`, OpenAPI und HTTP umgehen und gezielt Sicherheitsmechanismen vertiefen möchten:

1. **M00** (Setup & Zertifikate)
2. **M05** (Secret-Hygiene in `curl` & Bruno)
3. **M06** (OpenAPI `securitySchemes` & AND/OR-Logik)
4. **M07** (Custom CA & mTLS)
5. **M09 → M10 → M11 → M12** (OAuth 2.1, PKCE, OIDC, Introspection/Revocation & Security-Audits)

## Arbeitsweise pro Modul

1. **Theorie & Walkthrough** in `01-module/Mxx-.../README.md` durcharbeiten und Kommandos lokal nachvollziehen.
2. **Übung** in `02-uebungen/Mxx-uebung.md` selbstständig lösen (bei Blockaden erst Tipp 1, dann Tipp 2 aufklappen).
3. **Selbstkontrolle** anhand der Checkliste (*Definition of Done*) und Abgleich mit `03-loesungen/Mxx-loesung.md`.
