---
module_id: M10
title: "OAuth-Praxis: Authorization Code + PKCE & Client Credentials"
level: "Stufe 3 - Experten"
duration_minutes: 135
tools: ["Bruno (OpenCollection YAML)", "curl", "SoapUI Open Source 5.10.1"]
standards: ["RFC 9700", "OAuth 2.1 (Draft-17)", "RFC 7636 (PKCE)", "RFC 6749 §4.4"]
lab_services: ["keycloak", "mock-oauth2", "go-httpbin"]
prerequisites: ["M05", "M09"]
---

# Modul 10: OAuth-Praxis mit Keycloak / Mock-IdP in Bruno, `curl` und SoapUI

## 1. Lernziele

Nach Abschluss dieses Moduls kannst du:
1. Den **Authorization Code Flow + PKCE (`S256`)** über den System-Browser in Bruno einrichten und Token-Vererbung auf Collection-/Ordner-/Request-Ebene (`{{$oauth2.<tokenId>.access_token}}`) **konfigurieren**.
2. Automatische Token-Erneuerung und `401`-Recovery über `bru.getOauth2CredentialVar()` und `bru.resetOauth2Credential(credentialId)` in Bruno-Skripten **umsetzen**.
3. Den **Client-Credentials-Flow** (M2M) sicher via `curl -K -` (mit `client_secret_basic` bzw. `client_secret_post`) und `--oauth2-bearer` automatisieren.
4. Eine ehrliche OAuth-Kontrastkonfiguration in **SoapUI Open Source 5.10.1** (Bearer im Header, Refresh-Modi) einrichten und die PKCE-/Browser-Grenzen zu **ReadyAPI** sauber **benennen**.

## 2. Architektur und Kernkonzepte

In modernen API-Clients trennen wir zwei typische Einsatzszenarien:
- **Benutzer-Delegation (Authorization Code + PKCE):** Eine App handelt im Namen von `alice` oder `bob-admin`. Bruno öffnet hierfür den **System-Browser**, empfängt den Code am Callback und tauscht ihn mit `code_verifier` am Token-Endpunkt.
- **Machine-to-Machine (Client Credentials):** Ein Backend-Dienst oder CI-Runner (`m2m-service-client`) authentifiziert sich direkt mit `client_id` und `client_secret` am Token-Endpunkt — ganz ohne Benutzerinteraktion.

### Vergleichstabelle: OAuth-2-Fähigkeiten der drei Werkzeuge

| Merkmal | `curl` | Bruno (OpenCollection YAML) | SoapUI Open Source 5.10.1 |
| :--- | :--- | :--- | :--- |
| **Client Credentials (M2M)** | Ideal über `-K -` + `jq` + `--oauth2-bearer` | Nativ in Collection/Request (`grantType: client_credentials`) | Nativ über OAuth-2-Profil (`Client Credentials`) |
| **Authorization Code + PKCE (`S256`)** | Nur manuelle Demo (kein Browser-UI) | **Voll unterstützt** (System-Browser, `pkce: true`, Auto-Fetch/Refresh) | **Nicht dokumentiert / limitiert** (automatisierte Browser-OAuth-Skripte nur in **ReadyAPI**) |
| **Token-Vererbung & Refresh** | Manuell über Shell-Variablen | `auth: inherit`, `{{$oauth2.<id>.access_token}}`, `bru.resetOauth2Credential()` | OAuth-2-Profil pro Request; **immer** `Header` statt Query-String wählen! |

## 3. Geführter Walkthrough (`Bruno`, `curl`, `SoapUI`)

### `Bruno`: Drei Referenz-Collections

1. **Authorization Code + PKCE (`collections/bruno/oauth-pkce-lab/`):**
   - Konfiguriert in `opencollection.yml` OAuth 2 (`grantType: authorization_code`, `pkce: true`, Client `bruno-pkce-client`, `tokenId: keycloakPkce`).
   - Enthält die drei Vererbungsstufen:
     - `01-user_info_coll-auth.yml` (`auth: inherit` — erbt Token von Collection).
     - `02-user_info_request-auth.yml` (überschreibt `auth` direkt am Request).
     - `03-user_info_custom.yml` (liest Token programmatisch per `{{$oauth2.keycloakPkce.access_token}}` bzw. `bru.getOauth2CredentialVar("keycloakPkce", "access_token")` und nutzt `bru.resetOauth2Credential("keycloakPkce")` bei `401`).
   - Im Browser-Login anmelden als `alice` / `CHANGE_ME_LAB_USER_PASS` (siehe `lab/.env.example`).

2. **Client Credentials M2M (`collections/bruno/oauth-client-credentials-lab/`):**
   - Läuft komplett headless in GUI & `bru run -r --env local` mit `m2m-service-client` (`client_secret` sicher über `--env-var` / `secret: true`).

3. **Legacy ROPC Audit (`collections/bruno/oauth-legacy-ropc-audit/`):**
   - **WARNUNG (Legacy-Negativbeispiel):** Zeigt den veralteten `password`-Grant gegen `legacy-ropc-audit-client` ausschliesslich zu Audit-/Migrationszwecken — niemals in neuen Systemen einsetzen!

### `curl`: M2M Client Credentials ohne Shell-Leakage

```bash
set -a && source lab/.env && set +a
ACCESS_TOKEN="$(curl -sS --fail-with-body -K - \
  "http://localhost:8081/realms/api-lab/protocol/openid-connect/token" <<EOF | jq -r '.access_token'
user = "${KC_M2M_CLIENT_ID}:${KC_M2M_CLIENT_SECRET}"
data = "grant_type=client_credentials"
EOF
)"

curl -sS --fail-with-body -K - "http://localhost:8180/bearer" <<EOF | jq .
oauth2-bearer = "${ACCESS_TOKEN}"
EOF
```

### `SoapUI Open Source 5.10.1`: Kontrast-Konfiguration

Öffne [oauth-contrast-soapui-project.xml](../../collections/soapui/oauth-contrast-soapui-project.xml):
- Im Request-Tab **Auth → Add New Authorization → OAuth 2.0**:
  - **Access Token Position:** Zwingend **`Header`** (`Authorization: Bearer ...`) — **niemals** `Query String`!
  - Token wird entweder per Client-Credentials-Profil bezogen oder aus Bruno/`curl` für SOAP-/REST-Tests übernommen.
  - Für interaktives PKCE bleibt Bruno/Browser führend, weil SoapUI Open Source keinen automatisierten PKCE-Browser-Flow anbietet.

## 4. Typische Fallstricke und Troubleshooting

| Fehlerbild | Ursache | Diagnose & Lösung |
| :--- | :--- | :--- |
| Browser-Login in Bruno öffnet Callback nicht | Redirect-URI in Bruno stimmt nicht exakt mit `bruno-pkce-client` in Keycloak überein | In Keycloak erlaubt: `https://oauth.usebruno.com/callback`, `http://localhost:8080/callback`, `http://localhost:12345/callback` |
| `bru run` scheitert bei `oauth-pkce-lab` | `authorization_code` erfordert interaktive Browser-Anmeldung | In CI ausschliesslich `client_credentials` (`oauth-client-credentials-lab`) headless ausführen |
| `401 invalid_client` beim Token-Abruf | Secret fehlt in `--env-var` oder `client_secret_basic` vs. `client_secret_post` falsch | Bei `curl` `-K -` mit `user = "id:secret"` prüfen |
| SoapUI sendet `?access_token=...` in der URL | Standard-Dropdown in älterem Dialog nicht auf `Header` umgestellt | Im OAuth-2-Profil explizit *Add Token to: Header* wählen |

## 5. Spickzettel (Cheat Sheet)

| Element / Befehl | Bedeutung |
| :--- | :--- |
| `{{$oauth2.<tokenId>.access_token}}` | Greift auf das von Bruno verwaltete OAuth-2-Access-Token zu |
| `bru.getOauth2CredentialVar(id, "access_token")` | Liest OAuth-Token in Pre-/Post-Request-Skripten |
| `bru.resetOauth2Credential(id)` | Verwirft gecachtes Token (z. B. nach `401 Unauthorized`) |
| `grant_type=client_credentials` | Headless M2M-Flow für Backends & CI |
| `user = "client_id:client_secret"` in `-K -` | `client_secret_basic` ohne Secret-Leakage in `curl` |

## 6. Querverweise

- **Übung:** [M10-uebung.md](../../02-uebungen/M10-uebung.md)
- **Musterlösung:** [M10-loesung.md](../../03-loesungen/M10-loesung.md)
- **Bruno Collections:** [oauth-pkce-lab](../../collections/bruno/oauth-pkce-lab/opencollection.yml), [oauth-client-credentials-lab](../../collections/bruno/oauth-client-credentials-lab/opencollection.yml), [oauth-legacy-ropc-audit](../../collections/bruno/oauth-legacy-ropc-audit/opencollection.yml)
- **SoapUI Projekt:** [oauth-contrast-soapui-project.xml](../../collections/soapui/oauth-contrast-soapui-project.xml)
- **curl-Skript:** [m10-client-credentials.sh](../../scripts/curl/m10-client-credentials.sh)
