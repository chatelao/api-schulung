---
module_id: M12
title: "Token-Lebenszyklus, Sicherheits-Audits & Automatisierung"
level: "Stufe 3 - Experten"
duration_minutes: 120
tools: ["Bruno Desktop (Collection Runner)", "GitHub Actions (Überblick)"]
standards: ["RFC 7662 (Introspection)", "RFC 7009 (Revocation)", "RFC 8705 (mTLS)", "RFC 9449 (DPoP)", "RFC 9068"]
lab_services: ["keycloak", "mock-oauth2", "go-httpbin"]
prerequisites: ["M07", "M10", "M11"]
---

# Modul 12: Token-Lebenszyklus, Sicherheits-Audits & Automatisierung

## 1. Lernziele

Nach Abschluss dieses Moduls kannst du:
1. Das **Revocation-Dilemma** selbstenthaltener JWTs erklären und aktive Steuerung mittels **Token Introspection (RFC 7662)** und **Token Revocation (RFC 7009)** im Bruno-Workflow **anwenden**.
2. Schutzmechanismen gegen gestohlene Bearer Tokens (**mTLS-gebundene Tokens RFC 8705** und **DPoP RFC 9449**) konzeptionell **einordnen**.
3. Alle **sechs automatisierten Security-Audit-Negativtests** (`security-audit-suite`) im Bruno Desktop Collection Runner ausführen und auswerten.
4. Den automatisierten CI/CD-Ablauf in GitHub Actions verstehen (und bei Bedarf im Advanced-Track per CLI vertiefen).

## 2. Architektur und Kernkonzepte

Reale Angriffe brechen selten die Mathematik hinter JWTs — meist werden gültige Tokens aus Browsern oder Logs entwendet.

### Das Revocation-Dilemma
Wenn eine API ein JWT nur offline prüft, bleibt ein gestohlenes Token bis zu seinem Ablaufdatum (`exp`) gültig — selbst nach einem Logout!

**Gegenmassnahmen:**
1. **Kurze Laufzeiten** (z. B. 5 Minuten / `300s` in unserem Lab) + Refresh Token Rotation.
2. **Token Introspection (RFC 7662):** Aktive Nachfrage bei Keycloak (`active: true` vs. `active: false`).
3. **Token Revocation (RFC 7009):** Aktives Ungültigmachen beim Logout (`/revoke`).
4. **Sender-Constrained Tokens:** Binden das Token fest an einen Client-Schlüssel, sodass Diebe damit nichts anfangen können:
   - **mTLS-bound Tokens (RFC 8705)** — ideal für Server-zu-Server mit Zertifikaten.
   - **DPoP (RFC 9449)** — ideal für Browser-Apps ohne Client-Zertifikate.

## 3. Geführter Walkthrough (`Bruno Desktop` & `GitHub Actions`)

*(Voraussetzung: Für lokale Tests gegen Keycloak und `mock-oauth2` muss das Container-Labor aus [Advanced A00: Eigenes Docker-Labor](../../advanced/A00-lokales-labor-docker.md) laufen.)*

### Schritt 1: Die sechs automatisierten Security-Audit-Negativtests in Bruno Desktop

1. Öffne [collections/bruno/security-audit-suite/](../../collections/bruno/security-audit-suite/opencollection.yml) in **Bruno Desktop**.
2. Wähle das Environment **`ci`** und trage in das Secret-Feld `m2mClientSecret` den Laborwert `CHANGE_ME_LAB_M2M_SECRET` ein.
3. Klicke auf **Run Collection**: Alle 8 Schritte laufen automatisch durch — **ein Negativtest gilt als bestanden (`PASS`), wenn der erwartete Fehlercode eintritt!**
   - `01-invalid-redirect-uri`: Unbekannte Rücksprungadresse → `400 Bad Request`
   - `02-missing-pkce`: Login ohne PKCE → `302` mit `error=invalid_request`
   - `03-query-string-token-audit`: Token verbotenerweise als `?access_token=` → `401 Unauthorized`
   - `04-expired-or-invalid-token`: Abgelaufenes Token → `401 Unauthorized`
   - `05` & `05b`: Token per RFC 7009 widerrufen → Introspection meldet `active: false`
   - `06-tampered-jwt-header`: Manipulierter JWT-Payload → `401 Unauthorized`

### Schritt 2: Automatisierte Prüfung auf GitHub ansehen

Öffne die Ergebnisse des Workflows [.github/workflows/verify-labs.yml](../../.github/workflows/verify-labs.yml) auf GitHub Actions bzw. auf der **CI/CD-Ergebnisseite** im Handbuch: Bei jedem Push startet GitHub automatisch das komplette Docker-Labor und prüft alle Suites.

> **Für Fortgeschrittene (Shell, `curl` & `bru run`):** Wie du Introspection/Revocation mit `curl -K -` skriptest und `bru run` im Terminal startest, zeigt [Advanced A06](../../advanced/A06-token-lifecycle-bruno-cli-cicd.md).

## 4. Typische Fallstricke und Troubleshooting

| Fehlerbild | Ursache | Diagnose & Lösung |
| :--- | :--- | :--- |
| `00a-setup-m2m-token` liefert `401` | `m2mClientSecret` im Environment `ci` noch leer | `CHANGE_ME_LAB_M2M_SECRET` im Bruno-Environment `ci` eintragen |
| `02-missing-pkce` schlägt fehl wegen `200` | In Bruno ist automatisches Redirect-Folgen aktiv | `followRedirects: false` (in unserer Collection bereits voreingestellt) |
| Introspection liefert trotz gültigem Token `active: false` | Aufrufender Client steht nicht in `aud` des Tokens | Audience-Mapper für den Introspection-Client prüfen (im Lab bereits konfiguriert) |

## 5. Spickzettel (Cheat Sheet)

| Standard / Konzept | Bedeutung |
| :--- | :--- |
| **RFC 7662** (`/token/introspect`) | Aktive Statusprüfung eines Tokens (`active: true/false`) |
| **RFC 7009** (`/revoke`) | Aktiver Token-Widerruf |
| **RFC 8705** / **RFC 9449** | Sender-Constrained Tokens via mTLS bzw. DPoP |
| **Negativtest** | Prüft, dass unsichere Anfragen sauber abgewiesen werden |

## 6. Querverweise

- **Übung:** [M12-uebung.md](../../02-uebungen/M12-uebung.md)
- **Musterlösung:** [M12-loesung.md](../../03-loesungen/M12-loesung.md)
- **Bruno Collection:** [security-audit-suite](../../collections/bruno/security-audit-suite/opencollection.yml)
- **Advanced (Shell/`curl`/`bru run`):** [A06-token-lifecycle-bruno-cli-cicd.md](../../advanced/A06-token-lifecycle-bruno-cli-cicd.md)
