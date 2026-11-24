---
module_id: M10
title: "OAuth-Praxis: Authorization Code + PKCE & Client Credentials"
level: "Stufe 3 - Experten"
duration_minutes: 135
tools: ["Bruno (OpenCollection YAML)", "curl", "SoapUI Open Source 5.10.1"]
standards: ["RFC 9700", "OAuth 2.1 (Draft-17)", "RFC 7636 (PKCE)"]
lab_services: ["keycloak", "mock-oauth2", "go-httpbin"]
prerequisites: ["M05", "M09"]
---

# Übung M10: OAuth-Praxis mit Keycloak / Mock-IdP

## 1. Szenario und Zielzustand

Dein Team baut eine API-Test-Suite gegen den lokalen Keycloak-Realm `api-lab` auf. Interaktive Benutzer-Logins sollen modern über **Authorization Code + PKCE** in Bruno ablaufen, automatisierte Pipeline-Läufe über **Client Credentials** (`curl` + `bru run`), und ein bestehendes SoapUI-Projekt soll korrekt auf Header-basierte Bearer-Übergabe geprüft werden.

## 2. Aufgabenpakete

### Aufgabe A: Bruno PKCE-Login & Token-Vererbung (`oauth-pkce-lab`)
1. Öffne [collections/bruno/oauth-pkce-lab/](../collections/bruno/oauth-pkce-lab/opencollection.yml) in Bruno Desktop und wähle das Environment `local`.
2. Beziehe über die Collection-OAuth-Konfiguration (*Get Access Token*, Client `bruno-pkce-client`, Benutzer `alice` / Passwort aus `lab/.env`) ein Access Token per System-Browser.
3. Führe alle drei Requests (`01-user_info_coll-auth.yml`, `02-user_info_request-auth.yml`, `03-user_info_custom.yml`) aus und vergleiche, wie Collection-Vererbung vs. `{{$oauth2.keycloakPkce.access_token}}` funktioniert.

### Aufgabe B: Headless M2M-Flow mit `curl` und `bru run`
1. Führe [scripts/curl/m10-client-credentials.sh](../scripts/curl/m10-client-credentials.sh) aus und inspiziere den Token-Abruf über `-K -`.
2. Führe [collections/bruno/oauth-client-credentials-lab/](../collections/bruno/oauth-client-credentials-lab/opencollection.yml) per `bru run -r --env local` (mit `--env-var "clientSecret=${KC_M2M_CLIENT_SECRET}"`) aus.

### Aufgabe C: Legacy-Audit & SoapUI-Kontrast
1. Inspiziere [collections/bruno/oauth-legacy-ropc-audit/](../collections/bruno/oauth-legacy-ropc-audit/opencollection.yml) und prüfe in [realm-import.json](../lab/keycloak/realm-import.json), welcher Client dieses veraltete Muster noch zulässt (und warum er in Produktion abgeschaltet gehört).
2. Öffne [collections/soapui/oauth-contrast-soapui-project.xml](../collections/soapui/oauth-contrast-soapui-project.xml) in SoapUI OS 5.10.1 und prüfe, dass das OAuth-2-Profil den Token im `Authorization`-Header sendet.

### Bonus-Challenge D: `401`-Auto-Reset in Bruno testen
Simuliere im `after-response`-Skript von `03-user_info_custom.yml` ein abgelaufenes Token und prüfe, wie `bru.resetOauth2Credential("keycloakPkce")` das gespeicherte Token verwirft.

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Warum funktioniert oauth-pkce-lab nicht direkt in headless CI?</summary>

Der Authorization Code Flow erfordert eine interaktive Anmeldung des Benutzers im Browser (Consent/Login-Maske). Headless CI-Pipelines nutzen daher immer **Client Credentials** (`oauth-client-credentials-lab`) oder vorab konfigurierte Mock-Server.

</details>

<details>
<summary>Tipp 2 (Konkret): bru run Kommando für Aufgabe B</summary>

```bash
set -a && source lab/.env && set +a
cd collections/bruno/oauth-client-credentials-lab
bru run -r --env local \
  --env-var "clientSecret=${KC_M2M_CLIENT_SECRET}" \
  --reporter-skip-headers Authorization
```

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] PKCE-Login in `oauth-pkce-lab` liefert ein Token für `alice`, und alle 3 UserInfo-Requests geben `200 OK` zurück.
- [ ] `scripts/curl/m10-client-credentials.sh` und `bru run` auf `oauth-client-credentials-lab` laufen mit Exit-Code `0`.
- [ ] Keine Query-String-Tokens (`?access_token=`) und keine Klartext-Secrets in den Collection-Dateien.
- [ ] SoapUI-OS-Grenze zu ReadyAPI-Browser-Skripten ist dokumentiert und verstanden.
