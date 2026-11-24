---
module_id: M11
title: "OpenID Connect (OIDC): Discovery, JWKS, ID Token & /userinfo"
level: "Stufe 3 - Experten"
duration_minutes: 120
tools: ["Webbrowser", "Bruno Desktop (OpenCollection YAML)", "Interaktives Lernstudio"]
standards: ["OIDC Core 1.0", "OIDC Discovery 1.0", "RFC 7519 (JWT)", "RFC 7517 (JWKS)"]
lab_services: ["keycloak", "mock-oauth2"]
prerequisites: ["M09", "M10"]
---

# Übung M11: OpenID Connect (OIDC) — Discovery, JWKS & Token-Trennung

## 1. Szenario und Zielzustand

Ein Produktteam bindet Keycloak (`http://localhost:8081/realms/api-lab`) und `mock-oauth2-server` (`http://localhost:8090/default`) dynamisch über OpenID Connect an. Du liest beide Discovery-Dokumente im Browser aus, ordnest eine `kid` im `jwks_uri` zu, kontrastierst ID Token und Access Token im JWT-Inspektor und rufst `/userinfo` korrekt in Bruno Desktop auf.

## 2. Aufgabenpakete

### Aufgabe A: OIDC Discovery & JWKS im Browser auslesen
1. Öffne `http://localhost:8081/realms/api-lab/.well-known/openid-configuration` im Browser (und vergleiche mit `http://localhost:8090/default/.well-known/openid-configuration`).
2. Notiere die URLs für `issuer`, `userinfo_endpoint` und `jwks_uri`.
3. Öffne die `jwks_uri` im Browser und suche den Eintrag mit `"use": "sig"` (`kty: "RSA"`, `alg: "RS256"`). Notiere seine `kid`.

### Aufgabe B: ID Token vs. Access Token kontrastieren
1. Öffne das **Interaktive Lernstudio → Interaktive Labs → PKCE & JWT Inspektor** (oder einen lokalen JWT-Decoder — niemals produktive Geheimnisse in fremde Webseiten kopieren!) und lade ein Beispiel-ID-Token sowie ein Access Token.
2. Vergleiche in 4 Stichpunkten die Unterschiede bei `aud`, `typ`, `scope` und `nonce`.
3. Rufe in Bruno (`collections/bruno/oauth-pkce-lab/`) `01-user_info_coll-auth` mit dem **Access Token** auf (`200 OK`).

### Aufgabe C: OpenAPI 3.1 `openIdConnect` modellieren
Schreibe ein kurzes YAML-Snippet für `components.securitySchemes`, das dynamisch auf `http://localhost:8081/realms/api-lab/.well-known/openid-configuration` verweist (`type: openIdConnect`).

### Bonus-Challenge D: Verstehen, warum «Dekodieren ≠ Verifizieren» gilt
Ändere im JWT-Inspektor ein Zeichen im mittleren Teil (`Payload`) eines Tokens und erkläre, warum der Text zwar noch lesbar bleibt, eine API ihn aber anhand des `jwks_uri` ablehnen muss.

> **Hinweis:** Die Terminal-Variante mit `curl` und `jq` findest du in [Advanced A05](../advanced/A05-oauth21-pkce-oidc-curl.md).

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Woran erkennt man sofort ID Token vs. Access Token?</summary>

Im **ID Token** steht als `aud` die `client_id` der App (`bruno-pkce-client`), während im **Access Token** die Ziel-API (`api-lab-orders`) und Berechtigungen (`scope`, `realm_access.roles`) stehen.

</details>

<details>
<summary>Tipp 2 (Konkret): OpenAPI 3.1 Snippet für Aufgabe C</summary>

```yaml
components:
  securitySchemes:
    labOidc:
      type: openIdConnect
      openIdConnectUrl: http://localhost:8081/realms/api-lab/.well-known/openid-configuration
```

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] Discovery-Endpunkte von Keycloak und `mock-oauth2-server` wurden ausgelesen.
- [ ] `kid` und `jwks_uri` wurden gefunden und ihre Rolle bei der Signaturprüfung verstanden.
- [ ] `/userinfo` wurde mit dem **Access Token** (niemals ID Token) erfolgreich aufgerufen.
- [ ] Du kannst begründen, warum Dekodieren keine Signaturprüfung ersetzt.
