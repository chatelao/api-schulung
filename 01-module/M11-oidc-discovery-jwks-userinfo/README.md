---
module_id: M11
title: "OpenID Connect (OIDC): Discovery, JWKS, ID Token & /userinfo"
level: "Stufe 3 - Experten"
duration_minutes: 120
tools: ["curl", "jq", "Bruno (OpenCollection YAML)", "python3"]
standards: ["OIDC Core 1.0", "OIDC Discovery 1.0", "RFC 7519 (JWT)", "RFC 7517 (JWK/JWKS)", "RFC 8414"]
lab_services: ["keycloak", "mock-oauth2"]
prerequisites: ["M09", "M10"]
---

# Modul 11: OpenID Connect (OIDC) — Discovery, JWKS, ID Token & `/userinfo`

## 1. Lernziele

Nach Abschluss dieses Moduls kannst du:
1. Die Aufgaben von **OAuth 2.0 (Autorisierung)** und **OpenID Connect (Authentifizierung)** anhand von **Access Token** vs. **ID Token** strikt **trennen**.
2. Identity Provider dynamisch über **OIDC Discovery** (`/.well-known/openid-configuration`) anbinden, statt Endpunkte hart zu kodieren.
3. JWT-Header und -Claims mittels `jq` inspizieren und verstehen, weshalb **Dekodieren ≠ Verifizieren** ist (Signaturprüfung gegen `jwks_uri` mittels `kid`).
4. Den OIDC-`/userinfo`-Endpunkt korrekt mit dem **Access Token** (niemals dem ID Token!) abrufen und `type: openIdConnect` in OpenAPI 3.1 modellieren.

## 2. Architektur und Kernkonzepte

**Merksatz:**
- **OAuth 2.0 (Access Token):** *«Was darf diese Anwendung tun?»* — Zielgruppe (`aud`) ist eine **Fach-API** (Resource Server).
- **OIDC (ID Token):** *«Wer ist der angemeldete Benutzer?»* — Zielgruppe (`aud`) ist der **Client selbst** (`client_id`).

**Kritische Sicherheitsregel (Confused Deputy):**
- Sende **niemals** ein OIDC-ID-Token als `Authorization: Bearer <id_token>` an eine Backend-API!
- Missbrauche **niemals** ein fremdes Access Token im Client als Login-Nachweis ohne ID-Token-Validierung!

### Vergleichstabelle: ID Token vs. Access Token

| Merkmal | OIDC ID Token | OAuth 2.0/2.1 Access Token |
| :--- | :--- | :--- |
| **Zweck** | Authentifizierungsnachweis für den Client | Autorisierungsnachweis für Resource Server (APIs) |
| **Format** | Immer ein signiertes JWT (JWS) | JWT (RFC 9068) **oder** opaker Referenz-String |
| **Pflicht-Claim `aud`** | **`client_id`** der empfangenden App | Ziel-API / Resource-Identifier (z. B. `api-lab-orders`) |
| **Wichtige Claims** | `iss`, `sub`, `aud`, `exp`, `iat`, `nonce`, `auth_time` | `iss`, `sub`, `aud`, `scope`, `roles`, `exp`, `azp` |
| **Darf an `/userinfo` oder APIs gesendet werden?** | **NEIN!** (Bleibt im Client) | **JA** (`Authorization: Bearer <access_token>`) |

## 3. Geführter Walkthrough (`curl`, `jq`, `Bruno`)

### `curl` + `jq`: Discovery & JWKS-Zuordnung

```bash
# 1. OIDC Discovery Dokument abrufen
curl -sS "http://localhost:8081/realms/api-lab/.well-known/openid-configuration" \
  | jq '{issuer, authorization_endpoint, token_endpoint, userinfo_endpoint, jwks_uri}'

# 2. Oeffentliche Schluessel (JWKS) vom jwks_uri laden und Key-IDs (kid) anzeigen
JWKS_URI="$(curl -sS http://localhost:8081/realms/api-lab/.well-known/openid-configuration | jq -r '.jwks_uri')"
curl -sS "${JWKS_URI}" | jq '.keys[] | {kid, kty, alg, use}'
```

### JWT-Inspektion (`Dekodieren ≠ Verifizieren`)

```bash
# Hilfsfunktion zur Base64URL-Dekodierung eines JWT-Segments (1 = Header, 2 = Payload)
# ACHTUNG: Macht Claims nur lesbar! Kryptografische Echtheit erfordert Signaturpruefung gegen jwks_uri!
decode_jwt_part() {
  local part="$1"
  while (( ${#part} % 4 != 0 )); do part="${part}="; done
  printf '%s' "${part}" | tr '_-' '/+' | base64 -d | jq .
}
```

### `Bruno`: OIDC-Scopes (`openid profile email`) & `/userinfo`

In [collections/bruno/oauth-pkce-lab/](../../collections/bruno/oauth-pkce-lab/opencollection.yml):
1. Scopes auf `openid profile email` stellen und Token im Browser holen.
2. Bruno empfängt sowohl `access_token` als auch `id_token`.
3. `01-user_info_coll-auth.yml` ruft `http://localhost:8081/realms/api-lab/protocol/openid-connect/userinfo` ausschliesslich mit dem **Access Token** auf und prüft `sub` und `email`.

## 4. Typische Fallstricke und Troubleshooting

| Fehlerbild | Ursache | Diagnose & Lösung |
| :--- | :--- | :--- |
| API / `/userinfo` lehnt Token mit `401` ab, obwohl Login erfolgreich war | ID Token statt Access Token als `Bearer` gesendet (oder `aud` stimmt nicht) | JWT-Payload per `jq` inspizieren (`aud`, `typ`); strikt Access Token an APIs senden |
| Signaturprüfung schlägt nach IdP-Neustart plötzlich fehl | Öffentlicher Schlüssel wurde hartkodiert statt dynamisch über `jwks_uri` + `kid` geladen | Header-`kid` gegen aktuelles `jwks_uri` matchen |
| Base64URL-Dekodierung bricht mit `invalid input` ab | Base64URL nutzt `-`/`_` statt `+`/`/` und lässt `=`-Padding weg | Zeichen ersetzen (`tr '_-' '/+'`) und Padding auf Vielfache von 4 ergänzen |
| OIDC Discovery klappt in `curl`, scheitert im Browser | CORS-Policy des IdP oder falscher Issuer-Pfad (`404`) | Exakten Pfad (`/realms/api-lab/.well-known/openid-configuration`) und `webOrigins` prüfen |

## 5. Spickzettel (Cheat Sheet)

| Endpunkt / Claim | Bedeutung |
| :--- | :--- |
| `/.well-known/openid-configuration` | OIDC-Discovery-Metadaten (RFC 8615 / OIDC Discovery 1.0) |
| `jwks_uri` | JSON Web Key Set mit öffentlichen Schlüsseln zur Signaturprüfung (`kid`) |
| `iss` / `sub` / `aud` | Aussteller / eindeutige Benutzer-ID / vorgesehene Zielgruppe |
| `nonce` (im ID Token) | Schutz gegen Replay-Angriffe beim OIDC-Login |
| `Dekodieren ≠ Verifizieren` | `jq` liest Base64URL nur aus — erst die JWKS-Signaturprüfung beweist Echtheit |

## 6. Querverweise

- **Übung:** [M11-uebung.md](../../02-uebungen/M11-uebung.md)
- **Musterlösung:** [M11-loesung.md](../../03-loesungen/M11-loesung.md)
- **curl-Skript:** [m11-oidc-discovery-jwt.sh](../../scripts/curl/m11-oidc-discovery-jwt.sh)
