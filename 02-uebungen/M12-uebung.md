---
module_id: M12
title: "Token-Lebenszyklus, Sicherheits-Audits & CI/CD-Automatisierung"
level: "Stufe 3 - Experten"
duration_minutes: 120
tools: ["curl", "Bruno CLI (bru)", "GitHub Actions", "jq"]
standards: ["RFC 7662", "RFC 7009", "RFC 8705", "RFC 9449", "RFC 9068"]
lab_services: ["keycloak", "mock-oauth2", "go-httpbin"]
prerequisites: ["M07", "M10", "M11"]
---

# Übung M12: Token-Lebenszyklus, Sicherheits-Audits & CI/CD

## 1. Szenario und Zielzustand

Vor dem Produktivgang eines Kundenportals sollst du beweisen, dass widerrufene Tokens zuverlässig als inaktiv erkannt werden (`RFC 7662` + `RFC 7009`), dass sechs klassische OAuth-/API-Angriffsvektoren automatisiert abgewiesen werden (`security-audit-suite`), und dass die gesamte Suite ohne manuelle Eingriffe via `bru run` in CI läuft.

## 2. Aufgabenpakete

### Aufgabe A: Token Introspection & Revocation per `curl`
1. Starte [scripts/curl/m12-introspect-revoke.sh](../scripts/curl/m12-introspect-revoke.sh) oder führe die Schritte einzeln aus:
   - Access Token über `m2m-service-client` abrufen.
   - `/token/introspect` aufrufen → `"active": true` prüfen.
   - Token über `/revoke` (RFC 7009) widerrufen.
   - `/token/introspect` erneut aufrufen → `"active": false` prüfen!

### Aufgabe B: Die sechs Security-Audit-Negativtests in Bruno ausführen
1. Öffne [collections/bruno/security-audit-suite/](../collections/bruno/security-audit-suite/opencollection.yml) und analysiere alle sechs Testfälle (`01` bis `06`).
2. Starte die komplette Audit-Suite über die Bruno CLI (`bru run -r --env ci`) mit JUnit-Report-Ausgabe und ausgeblendetem `Authorization`-Header.

### Aufgabe C: CI/CD-Workflow prüfen (`.github/workflows/verify-labs.yml`)
Analysiere den GitHub-Actions-Workflow [.github/workflows/verify-labs.yml](../.github/workflows/verify-labs.yml) und prüfe, wie dort das Labor gestartet, OpenAPI importiert und `bru run` ausgeführt wird.

### Bonus-Challenge D: DPoP vs. mTLS Architekturentscheidung
Formuliere eine kurze Entscheidungshilfe (3 Kriterien), wann dein Unternehmen für API-Clients **mTLS-bound Tokens (RFC 8705)** und wann **DPoP (RFC 9449)** einsetzen sollte.

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Warum liefert bru run bei Negativtests Exit-Code 0?</summary>

Ein automatisierter Negativtest besteht dann, wenn seine **Assertion** das erwartete Fehlerverhalten (z. B. `res.status === 401` oder `res.body.active === false`) bestätigt. Nur wenn ein Request fälschlich `200 OK` liefert, schlägt die Assertion fehl.

</details>

<details>
<summary>Tipp 2 (Konkret): CLI-Aufruf für Aufgabe B</summary>

```bash
set -a && source lab/.env && set +a
cd collections/bruno/security-audit-suite
bru run -r --env ci \
  --env-var "m2mClientSecret=${KC_M2M_CLIENT_SECRET}" \
  --reporter-junit /tmp/m12-audit-junit.xml \
  --reporter-skip-headers Authorization
```

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] Introspection vor Revocation liefert `"active": true`, nach `/revoke` `"active": false`.
- [ ] Alle 6 Requests in `collections/bruno/security-audit-suite` bestehen ihre Negativ-Assertions.
- [ ] `bru run -r --env ci` endet mit Exit-Code `0` und erzeugt einen JUnit-Report ohne geleakte `Authorization`-Header.
