# Musterlösung M09: OAuth 2.0 vs. RFC 9700 & OAuth 2.1

## Lösung Aufgabe A & B: Automatisierte Prüfung

Siehe ausführbares Referenzskript: [scripts/curl/m09-pkce-manual.sh](../scripts/curl/m09-pkce-manual.sh).

### Erwartete Statuscodes auf `bruno-pkce-client` (bei gültiger `redirect_uri`)
- `response_type=token` (Implicit): **HTTP `302 Found`** mit `#error=unauthorized_client` (`Implicit flow is disabled for the client.`)
- Fehlendes `code_challenge`: **HTTP `302 Found`** mit `?error=invalid_request` (`Missing parameter: code_challenge_method`)
- `code_challenge_method=plain`: **HTTP `302 Found`** mit `?error=invalid_request` (`Invalid parameter: code challenge method is not matching the configured one`)
- `code_challenge_method=S256`: **HTTP `200`** (Keycloak Login-Formular)

## Lösung Aufgabe C: Schutz vor Code-Interception

1. Beim Start des Authorization-Flows erzeugt nur der legitime Client den zufälligen `code_verifier` und sendet ausschliesslich den Einweg-Hash (`code_challenge = SHA256(code_verifier)`) an den Authorization Server.
2. Fängt ein Angreifer den `authorization_code` in der Redirect-URL ab, fehlt ihm der ursprüngliche `code_verifier` (SHA-256 ist nicht umkehrbar).
3. Sendet der Angreifer den Code ohne oder mit falschem `code_verifier` an `/token`, schlägt der Hash-Vergleich fehl und der Authorization Server antwortet mit `400 invalid_grant`.

## Lösung Bonus-Challenge D: Legacy-Audit

Auf `bruno-pkce-client` ist `directAccessGrantsEnabled: false` gesetzt → ein Versuch mit `grant_type=password` scheitert direkt mit `400 unauthorized_client`.
