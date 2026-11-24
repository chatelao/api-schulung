# Musterlösung M10: OAuth-Praxis mit Keycloak in Bruno & SoapUI

## Lösung Aufgabe A: Bruno PKCE-Login (`oauth-pkce-lab`)
1. Nach Anmeldung als `alice` / `CHANGE_ME_LAB_USER_PASS` im System-Browser speichert Bruno das Token unter der ID `keycloakPkce`.
2. Alle drei Requests (`01-user_info_coll-auth`, `02-user_info_request-auth`, `03-user_info_custom`) geben `200 OK` mit `"preferred_username": "alice"` zurück.

## Lösung Aufgabe B: M2M (`oauth-client-credentials-lab`)
- Mit `clientSecret = CHANGE_ME_LAB_M2M_SECRET` im Secret-Feld von Environment `local` bezieht Bruno automatisch ein M2M-Token, ruft `go-httpbin /bearer` auf (`authenticated: true`) und bestätigt in `02-introspect-m2m-token` `active: true`.

## Lösung Aufgabe C & Bonus D
- `oauth-legacy-ropc-audit` nutzt `grant_type=password` und ist nach RFC 9700 / OAuth 2.1 unzulässig (Client sieht das Benutzerpasswort).
- `bru.resetOauth2Credential("keycloakPkce")` löscht im `401`-Fehlerfall das abgelaufene Token aus Brunos Cache, sodass der nächste Aufruf sauber ein frisches Token anfordert.

*(Für die Shell-/`curl`-Lösung siehe [Advanced A05](../advanced/A05-oauth21-pkce-oidc-curl.md).)*
