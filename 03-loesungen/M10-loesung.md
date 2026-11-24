# Musterlösung M10: OAuth-Praxis mit Keycloak / Mock-IdP

## Lösung Aufgabe A: Bruno PKCE-Login (`oauth-pkce-lab`)

1. Collection `collections/bruno/oauth-pkce-lab` in Bruno Desktop öffnen, Environment `local` aktivieren.
2. In den Collection-Auth-Einstellungen auf **Get Access Token** klicken → Browser öffnet Keycloak Login (`http://localhost:8081/realms/api-lab/...`).
3. Mit `alice` / `CHANGE_ME_LAB_USER_PASS` anmelden.
4. Alle drei Requests (`01-user_info_coll-auth.yml`, `02-user_info_request-auth.yml`, `03-user_info_custom.yml`) liefern `200 OK` mit `"preferred_username": "alice"`.

## Lösung Aufgabe B: Headless M2M (`curl` & `bru run`)

- `curl`-Referenz: [scripts/curl/m10-client-credentials.sh](../../scripts/curl/m10-client-credentials.sh)
- Bruno CLI:
  ```bash
  set -a && source lab/.env && set +a
  (
    cd collections/bruno/oauth-client-credentials-lab
    bru run -r --env local \
      --env-var "clientSecret=${KC_M2M_CLIENT_SECRET}" \
      --reporter-skip-headers Authorization
  )
  ```

## Lösung Aufgabe C & Bonus D: Legacy-Audit, SoapUI & `resetOauth2Credential`

- Der einzige ROPC-fähige Client ist `legacy-ropc-audit-client` (`directAccessGrantsEnabled: true`), der gemäss RFC 9700 §2.4 / OAuth 2.1 abgeschaltet werden muss.
- In `03-user_info_custom.yml` prüft das Post-Response-Skript auf `res.status === 401` und ruft bei Bedarf `bru.resetOauth2Credential("keycloakPkce")` auf, sodass beim nächsten Aufruf ein frisches Token geholt wird.
