---
module_id: M10
title: "OAuth-Praxis: Authorization Code + PKCE & Client Credentials"
level: "Stufe 3 - Experten"
duration_minutes: 135
tools: ["Bruno Desktop (OpenCollection YAML)", "SoapUI Open Source 5.10.1"]
standards: ["RFC 9700", "OAuth 2.1 (Draft-17)", "RFC 7636 (PKCE)"]
lab_services: ["keycloak", "mock-oauth2", "go-httpbin"]
prerequisites: ["M05", "M09"]
---

# Übung M10: OAuth-Praxis mit Keycloak in Bruno Desktop & SoapUI

## 1. Szenario und Zielzustand

Dein Team richtet den Zugriff auf geschützte APIs über Keycloak (`api-lab`) ein. Interaktive Benutzer-Logins laufen über **Authorization Code + PKCE** in **Bruno Desktop**, Server-zu-Server-Zugriffe über **Client Credentials**, und in **SoapUI OS 5.10.1** kontrollierst du die korrekte Header-Übertragung eines OAuth-Tokens.

## 2. Aufgabenpakete

### Aufgabe A: Bruno PKCE-Login & Token-Vererbung (`oauth-pkce-lab`)
1. Öffne [collections/bruno/oauth-pkce-lab/](../collections/bruno/oauth-pkce-lab/opencollection.yml) in Bruno Desktop und wähle Environment `local`.
2. Beziehe über die Collection-Auth-Einstellungen (*Get Access Token*, Client `bruno-pkce-client`, Benutzer `alice` / `CHANGE_ME_LAB_USER_PASS`) ein Access Token im System-Browser.
3. Führe alle drei Requests (`01-user_info_coll-auth`, `02-user_info_request-auth`, `03-user_info_custom`) aus und vergleiche, wie Collection-Vererbung vs. `{{$oauth2.keycloakPkce.access_token}}` funktioniert.

### Aufgabe B: Machine-to-Machine (`oauth-client-credentials-lab`)
1. Öffne [collections/bruno/oauth-client-credentials-lab/](../collections/bruno/oauth-client-credentials-lab/opencollection.yml) in Bruno Desktop.
2. Trage im Environment `local` das Secret `CHANGE_ME_LAB_M2M_SECRET` in das Secret-Feld `clientSecret` ein.
3. Starte den **Collection Runner** für `01-call-bearer-m2m` und `02-introspect-m2m-token` und verifiziere, dass Bruno das M2M-Token automatisch im Hintergrund holt und beide Tests bestehen (`200 OK`, `active: true`).

### Aufgabe C: Legacy-Audit & SoapUI-Kontrast
1. Inspiziere [collections/bruno/oauth-legacy-ropc-audit/](../collections/bruno/oauth-legacy-ropc-audit/opencollection.yml) und notiere anhand der Dokumentation in der Collection, warum dieser Flow (`password`) abgelöst werden muss.
2. Öffne [collections/soapui/oauth-contrast-soapui-project.xml](../collections/soapui/oauth-contrast-soapui-project.xml) in SoapUI OS 5.10.1 und prüfe im OAuth-2-Profil `KeycloakM2M`, dass **Access Token Position = Header** gewählt ist.

### Bonus-Challenge D: `401`-Auto-Reset in Bruno verstehen
Sieh dir im Request `03-user_info_custom` von `oauth-pkce-lab` den Tab **Script → Post Response** an (`bru.resetOauth2Credential("keycloakPkce")`) und erkläre, warum dieses Muster bei abgelaufenen Tokens hilfreich ist.

> **Hinweis:** Die M2M-Automatisierung mit `curl -K -` und `bru run` findest du in [Advanced A05](../advanced/A05-oauth21-pkce-oidc-curl.md) und [A06](../advanced/A06-token-lifecycle-bruno-cli-cicd.md).

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Warum braucht Client Credentials keinen Browser?</summary>

Bei *Client Credentials* handelt kein menschlicher Benutzer, sondern ein Backend-Dienst mit eigener `client_id` und `client_secret`. Daher gibt es keine Login-Maske.

</details>

<details>
<summary>Tipp 2 (Konkret): Zugangsdaten für Aufgabe A und B</summary>

- Benutzer für Browser-PKCE: `alice` / `CHANGE_ME_LAB_USER_PASS`
- Client Secret für M2M (`clientSecret` in `oauth-client-credentials-lab`): `CHANGE_ME_LAB_M2M_SECRET`

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] PKCE-Login in `oauth-pkce-lab` liefert ein Token für `alice`, und alle 3 UserInfo-Requests geben `200 OK` zurück.
- [ ] `oauth-client-credentials-lab` läuft im Bruno Collection Runner grün durch.
- [ ] Keine Query-String-Tokens (`?access_token=`) und keine Klartext-Secrets in den YAML-Dateien.
- [ ] SoapUI-OS-Grenze gegenüber ReadyAPI-Browser-OAuth ist verstanden.
