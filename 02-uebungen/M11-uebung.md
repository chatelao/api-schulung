---
module_id: M11
title: "OpenID Connect (OIDC): Discovery, JWKS, ID Token & /userinfo"
level: "Stufe 3 - Experten"
duration_minutes: 120
tools: ["curl", "jq", "Bruno (OpenCollection YAML)", "python3"]
standards: ["OIDC Core 1.0", "OIDC Discovery 1.0", "RFC 7519 (JWT)", "RFC 7517 (JWKS)"]
lab_services: ["keycloak", "mock-oauth2"]
prerequisites: ["M09", "M10"]
---

# Übung M11: OpenID Connect (OIDC) — Discovery, JWKS & Token-Trennung

## 1. Szenario und Zielzustand

Ein Microservice-Team bindet Keycloak (`http://localhost:8081/realms/api-lab`) und alternativ `mock-oauth2-server` (`http://localhost:8090/default`) per OpenID Connect an. Du sollst beide Discovery-Endpunkte dynamisch auslesen, einen echten JWT-Header über `kid` seinem öffentlichen Schlüssel in `jwks_uri` zuordnen, die Claims von ID Token und Access Token kontrastieren und den Fehlgebrauch eines ID Tokens als API-Bearer-Token widerlegen.

## 2. Aufgabenpakete

### Aufgabe A: OIDC Discovery & JWKS-Key-Matching per `curl` + `jq`
1. Lade `http://localhost:8081/realms/api-lab/.well-known/openid-configuration` und extrahiere `issuer`, `jwks_uri` und `userinfo_endpoint`.
2. Beziehe ein Token über `m2m-service-client` (oder deinen Browser-Login in `oauth-pkce-lab`), dekodiere den JWT-Header und lies `alg` und `kid` aus.
3. Suche genau diese `kid` im JSON der `jwks_uri` und verifiziere, dass der öffentliche RSA-Schlüssel (`kty: RSA`, `use: sig`) vorhanden ist.

### Aufgabe B: ID Token vs. Access Token kontrastieren
1. Führe in `collections/bruno/oauth-pkce-lab` einen Login mit Scope `openid profile email` durch.
2. Vergleiche die Claims (`aud`, `scope`, `typ`, `azp`, `email`, `nonce`) von ID Token und Access Token schriftlich in 4 Stichpunkten.
3. Rufe `/userinfo` mit dem **Access Token** auf (`200 OK`) und teste als Gegenprobe (nur lokal im Lab!) was passiert, wenn fälschlich ein ID Token an `/userinfo` gesendet wird.

### Aufgabe C: OpenAPI 3.1 `openIdConnect` deklarieren
Ergänze in einem Test-YAML ein `securitySchemes`-Objekt vom Typ `openIdConnect`, das dynamisch auf `http://localhost:8081/realms/api-lab/.well-known/openid-configuration` verweist.

### Bonus-Challenge D: Kryptografische JWT-Signaturprüfung (Verifizieren ≠ Dekodieren)
Prüfe mit einem kleinen Python- oder Node-Snippet (oder `scripts/curl/m11-oidc-discovery-jwt.sh`), wie sich ein manipuliertes JWT zwar mit `jq` dekodieren lässt, aber gegen `jwks_uri` kryptografisch durchfällt.

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Woran erkennt man sofort den Unterschied zwischen ID Token und Access Token?</summary>

Im **ID Token** steht als `aud` die `client_id` der Anwendung (z. B. `bruno-pkce-client`), während im **Access Token** als `aud` die Ziel-API (z. B. `api-lab-orders`) sowie `scope` / `realm_access.roles` stehen.

</details>

<details>
<summary>Tipp 2 (Konkret): Skript-Referenz für Discovery + JWKS-Lookup</summary>

Starte und inspiziere [scripts/curl/m11-oidc-discovery-jwt.sh](../scripts/curl/m11-oidc-discovery-jwt.sh).

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] Discovery-Endpunkte von Keycloak und `mock-oauth2-server` wurden per `curl` + `jq` ausgelesen.
- [ ] Die `kid` eines echten Tokens wurde eindeutig in `jwks_uri` wiedergefunden.
- [ ] `/userinfo` wurde erfolgreich mit dem **Access Token** (niemals dem ID Token) aufgerufen.
- [ ] Du kannst begründen, warum Base64URL-Dekodierung per `jq` keine Signaturverifikation ersetzt.
