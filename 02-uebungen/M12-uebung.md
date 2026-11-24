---
module_id: M12
title: "Token-Lebenszyklus, Sicherheits-Audits & Automatisierung"
level: "Stufe 3 - Experten"
duration_minutes: 120
tools: ["Bruno Desktop (Collection Runner)", "Webbrowser"]
standards: ["RFC 7662", "RFC 7009", "RFC 8705", "RFC 9449", "RFC 9068"]
lab_services: ["keycloak", "mock-oauth2", "go-httpbin"]
prerequisites: ["M07", "M10", "M11"]
---

# Übung M12: Token-Lebenszyklus & Sicherheits-Audits

## 1. Szenario und Zielzustand

Vor dem Produktivgang eines Kundenportals prüfst du in **Bruno Desktop**, dass widerrufene Tokens zuverlässig als inaktiv erkannt werden (`RFC 7662` + `RFC 7009`) und alle sechs klassischen OAuth-/API-Angriffsvektoren automatisch abgewehrt werden (`security-audit-suite`).

## 2. Aufgabenpakete

### Aufgabe A: Token Introspection & Revocation in Bruno Desktop
1. Öffne [collections/bruno/oauth-client-credentials-lab/](../collections/bruno/oauth-client-credentials-lab/opencollection.yml) und führe `02-introspect-m2m-token` aus (`"active": true`).
2. Öffne anschliessend [collections/bruno/security-audit-suite/](../collections/bruno/security-audit-suite/opencollection.yml), wähle das Environment **`ci`** und trage `CHANGE_ME_LAB_M2M_SECRET` in das Secret-Feld `m2mClientSecret` ein.
3. Führe `00a-setup-m2m-token` → `05-revoke-token-step` → `05b-introspect-revoked-token` nacheinander aus und verifiziere, dass die Introspection nach dem Widerruf `"active": false` meldet!

### Aufgabe B: Die sechs Security-Audit-Negativtests als Collection ausführen
Starte in **Bruno Desktop** über den **Collection Runner** die gesamte `security-audit-suite` und prüfe, dass alle 8 Schritte inklusive sämtlicher 6 Negativtests (`01` bis `06`) grün bestehen.

### Aufgabe C: GitHub-Actions-CI-Berichte auswerten
Öffne die veröffentlichte **CI/CD-Ergebnisseite** auf GitHub Pages (bzw. in `docs/ci-results.md`) und überprüfe, wie alle Suites automatisiert dokumentiert werden.

### Bonus-Challenge D: DPoP vs. mTLS Architekturentscheidung
Formuliere eine kurze Entscheidungshilfe (3 Kriterien), wann ein Projekt **mTLS-bound Tokens (RFC 8705)** und wann **DPoP (RFC 9449)** einsetzen sollte.

> **Hinweis:** Die Shell-Skripte (`m12-introspect-revoke.sh`) und der `bru run`-CLI-Workflow liegen im [Advanced-Track](../advanced/A06-token-lifecycle-bruno-cli-cicd.md).

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Warum gelten Negativtests mit Status 400 oder 401 als bestanden?</summary>

Beim Security-Audit wollen wir beweisen, dass ein Angriff **fehlschlägt**. Wenn also ein manipuliertes Token mit `401 Unauthorized` abgewiesen wird, erfüllt das genau die Sicherheitsanforderung — der Test ist grün (`PASS`).

</details>

<details>
<summary>Tipp 2 (Konkret): Reihenfolge in security-audit-suite</summary>

Starte immer den gesamten **Collection Runner** (nicht nur einzelne Requests wie `05b` allein), weil `00a-setup-m2m-token` zuerst `validToken` und `tamperedJwt` für die nachfolgenden Tests im Speicher ablegt!

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] Introspection vor Revocation liefert `"active": true`, nach `/revoke` `"active": false`.
- [ ] Alle 8 Requests in `collections/bruno/security-audit-suite` bestehen im Bruno Collection Runner.
- [ ] Du kannst den Unterschied zwischen mTLS-gebundenen Tokens und DPoP erklären.
