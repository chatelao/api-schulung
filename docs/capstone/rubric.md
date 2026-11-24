# Bewertungsrubrik (Capstone: Hybride Enterprise-Auftragsintegration)

Maximale Punktzahl: **100 Punkte** (Bestanden ab **80 Punkte** und **0 Sicherheitsverstösse**).

| Kategorie | Kriterien | Max. Punkte |
| :--- | :--- | :---: |
| **1. OIDC & OAuth 2.1 Konformität** | Discovery genutzt; PKCE `S256` im Browser-Flow; strikte Trennung ID Token ≠ Access Token; `iss`/`sub`/`aud`/`roles` korrekt ausgewertet | 25 |
| **2. OpenAPI 3.1 & Bruno YAML** | Sortenreines OpenCollection YAML (`.yml`, `opencollection: 1.0.0`, keine `.bru`-Dateien); `bru.setVar()` statt `setEnvVar()`; erfolgreiche Chaining-Assertions | 20 |
| **3. Transport- & mTLS-Sicherheit** | Custom CA (`--cacert`, niemals `-k`); erfolgreicher mTLS-Handshake auf Port `8443` via `--client-cert-config` (`"enabled": true`) | 20 |
| **4. SOAP / WSDL & WS-Security** | `CreateSecureOrder` gegen `/soap/secure` mit `Timestamp` → `UsernameToken (Digest)` → `Signature`; XPath Match & WS-Security Status Assertion grün | 20 |
| **5. CI-Lauf, Revocation & Hygiene** | `bru run -r` mit Exit-Code `0` + `--reporter-skip-headers Authorization`; Token per RFC 7009 widerrufen (`active: false`); 0 Secrets/Keys in Git | 15 |

## Ausschlusskriterien (Sofortiges Nichtbestehen bei Verstoss)

- Eingecheckte `.env`, private Schlüssel (`*.key`, `*.pfx`, `*.jks`) oder Klartext-Passwörter in `curl`-Kommandos.
- Verwendung von `curl -k` / `--insecure` oder `?access_token=` in URLs.
- Senden eines OIDC-ID-Tokens als `Authorization: Bearer` an eine Fach-API.
