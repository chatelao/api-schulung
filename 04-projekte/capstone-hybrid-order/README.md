# Abschlussprojekt (Capstone): Hybride Enterprise-Auftragsintegration

- **Dauer:** 180 Minuten (3,0 Stunden)
- **Werkzeuge:** `curl`, **Bruno (OpenCollection YAML + `bru`)**, **SoapUI Open Source 5.10.1**, `jq`, `openssl`
- **Voraussetzungen:** Module `M00`–`M12` sowie laufendes Docker-Labor (`./00-setup/smoke-test.sh`)

## 1. Szenario

Ein E-Commerce-Portal integriert ein modernes REST-Auftragssystem (`petstore3` + `tls-proxy` mTLS-Gateway) mit einem klassischen ERP-Abrechnungsbackend (`soap-service` mit WS-Security) und einem zentralen Identity Provider (`keycloak`, Realm `api-lab`).

Deine Aufgabe ist es, den vollständigen Ende-zu-Ende-Prozess **reproduzierbar, sicherheitskonform und CI-fähig** aufzubauen und durch automatisierte Prüfskripte abzunehmen.

## 2. Die vier Projektphasen (180 Minuten)

### Teil 1: Identität & Autorisierung (OIDC / OAuth 2.1 — 40 Min)
1. Rufe die OIDC-Discovery-Metadaten von `http://localhost:8081/realms/api-lab/.well-known/openid-configuration` ab.
2. Beziehe für interaktive Tests per **Authorization Code + PKCE (`S256`)** in Bruno (`oauth-pkce-lab`) ein Token für `alice` / `bob-admin` und prüfe `iss`, `sub`, `aud` und `roles` (inkl. strikter Trennung: ID Token bleibt im Client!).
3. Beziehe für den automatisierten CI-Teil ein Machine-to-Machine-Token über `m2m-service-client` (`client_credentials`).

### Teil 2: REST / OpenAPI-Workflow mit mTLS (Bruno YAML — 50 Min)
1. Inspiziere die bereitgestellte OpenAPI-3.1-Spezifikation [openapi-hybrid-order.yaml](openapi-hybrid-order.yaml).
2. Öffne die Capstone-Collection [collections/bruno/capstone-hybrid-order/](../../collections/bruno/capstone-hybrid-order/opencollection.yml).
3. Lege über Petstore (`http://localhost:8080/api/v3/store/order`) einen Auftrag an, extrahiere die `orderId` per `after-response`-Skript in eine flüchtige Runtime-Variable (`bru.setVar()`), und sende das M2M-Bearer-Token zusätzlich über **striktes mTLS** (`https://localhost:8443/headers`) an den `tls-proxy`.

### Teil 3: SOAP / WSDL-Weiterverarbeitung mit WS-Security (SoapUI OS & `curl` — 50 Min)
1. Übergib die Auftragsdaten in [order-service-wss-soapui-project.xml](../../collections/soapui/order-service-wss-soapui-project.xml) an `http://localhost:9000/soap/secure` (`CreateSecureOrder`).
2. Wende das Outgoing-WSS-Profil (`Timestamp` → `UsernameToken PasswordDigest` → `Signature` über `<soap:Body>`) an.
3. Validere die Antwort per **XPath Match** (`//tns:signatureVerified = 'true'`) und **WS-Security Status Assertion**.

### Teil 4: Automatisierung, Revocation & Hygiene-Abnahme (40 Min)
1. Starte die komplette Bruno-Capstone-Suite über den **Bruno Collection Runner** (Umgebung `local`, Secret `m2mClientSecret = CHANGE_ME_LAB_M2M_SECRET` und hinterlegtes mTLS-Client-Zertifikat für `localhost`).
2. Prüfe im letzten Schritt (`07-verify-revoked-introspect`), dass das Token sauber per **RFC 7009 (`/revoke`)** widerrufen wurde (`active: false`).
3. *(Optional / Advanced CLI):* Wer die Abnahme im Terminal ausführen möchte, startet `./04-projekte/capstone-hybrid-order/verify-capstone.sh` (siehe [Advanced A06](../../advanced/A06-token-lifecycle-bruno-cli-cicd.md)) und prüft per `git status`, dass keine Secrets oder privaten Schlüssel versioniert wurden.

## 3. Abnahme-Skript & Bewertungsrubrik

- **Bewertungsrubrik:** [RUBRIC.md](RUBRIC.md)
- **Automatisierte End-to-End-Verifikation:** `./04-projekte/capstone-hybrid-order/verify-capstone.sh`
