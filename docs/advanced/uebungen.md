# Advanced-Übungen: Shell, `curl`, `jq`, `openssl` & CLI-Automatisierung

Diese Übungssammlung bündelt sämtliche Kommandozeilen- und Skripting-Aufgaben für fortgeschrittene Teilnehmende, die Schnittstellen über `curl` und `@usebruno/cli` (`bru`) steuern und automatisieren möchten.

---

## Aufgabe A1: HTTP-CRUD & Timing mit `curl` + `jq`

1. Sende einen `GET`-Request an `http://localhost:8180/anything/kurs` mit dem Header `X-Kurs-Teilnehmer: dein-name` und extrahiere die zurückgespiegelten Header via `jq`.
2. Verfolge Weiterleitungen unter `http://localhost:8180/redirect/3` einmal ohne und einmal mit `-L`.
3. Provoziere an `http://localhost:8080/api/v3/pet` gezielt `415`, `404` und `405`.
4. Führe ein automatisiertes CRUD-Skript (`POST` → `jq` ID-Extraktion → `GET` → `PUT` → `DELETE` → `404`-Check) gegen `petstore3` aus und miss die Request-Zeiten mit `curl -w`.

<details>
<summary>Tipp 1 & 2</summary>

```bash
curl -sS -o /dev/null -w '{"http_code":%{http_code},"dns":%{time_namelookup},"connect":%{time_connect},"ttfb":%{time_starttransfer},"total":%{time_total}}\n' \
  "http://localhost:8080/api/v3/pet/findByStatus?status=available" | jq .
```
Referenzskript: [scripts/curl/m01-petstore-crud.sh](https://github.com/chatelao/api-schulung/blob/main/scripts/curl/m01-petstore-crud.sh)

</details>

---

## Aufgabe A2: SOAP 1.1/1.2 & XSD-Faults per `curl`

1. Lade die WSDL von `http://localhost:9000/soap?wsdl` per `curl`.
2. Sende `create-order-soap11.xml` (`text/xml` + `SOAPAction`) und `create-order-soap12.xml` (`application/soap+xml`) via `--data-binary`.
3. Provoziere mit `invalid-xsd-fault.xml` einen `soap:Client`-Fault und beobachte, was passiert, wenn bei SOAP 1.1 der `SOAPAction`-Header fehlt.

<details>
<summary>Tipp 1 & 2</summary>

Verwende immer `--data-binary @datei.xml`, damit Zeilenumbrüche erhalten bleiben.
Referenzskript: [scripts/curl/m03-soap-call.sh](https://github.com/chatelao/api-schulung/blob/main/scripts/curl/m03-soap-call.sh)

</details>

---

## Aufgabe A3: Sichere Credentials in `curl` (`-K -` & `--netrc-file`)

1. Lade `lab/.env` (`set -a && source lab/.env && set +a`).
2. Teste **Basic Auth**, **Digest Auth** (`--digest`), **X-Api-Key** und **Bearer Token** (`oauth2-bearer`) gegen `http://localhost:8180` ausschliesslich via `curl -K -` (`stdin`) oder `--netrc-file` (`chmod 600`).
3. Prüfe per `git status` und `git check-ignore`, dass keine `.env` oder `.netrc` im Repository liegt.

<details>
<summary>Tipp 1 & 2</summary>

Referenzskript: [scripts/curl/m05-auth-hygiene.sh](https://github.com/chatelao/api-schulung/blob/main/scripts/curl/m05-auth-hygiene.sh)

</details>

---

## Aufgabe A4: TLS, `openssl` & mTLS mit `curl`

1. Prüfe `lab/certs/out/server.crt` per `openssl x509 -noout -subject -issuer -ext subjectAltName`.
2. Belege, dass `https://localhost:8444/headers` ohne `--cacert` scheitert und mit `--cacert lab/certs/out/ca.crt` `200 OK` liefert (niemals `-k`!).
3. Belege am mTLS-Port `https://localhost:8443/headers` sowohl den Negativfall ohne Client-Zertifikat (`400`) als auch den Positivfall mit `--cert` + `--key` (sowie optional PKCS#12 `.pfx` via `-K -`).

<details>
<summary>Tipp 1 & 2</summary>

Referenzskript: [scripts/curl/m07-mtls-test.sh](https://github.com/chatelao/api-schulung/blob/main/scripts/curl/m07-mtls-test.sh)

</details>

---

## Aufgabe A5: PKCE `S256`, M2M & OIDC JWKS per `curl`

1. Erzeuge in Bash einen `code_verifier` und die zugehörige `S256`-`code_challenge` via `openssl` (`printf '%s'`, niemals `echo`!).
2. Prüfe gegen Keycloak (`bruno-pkce-client`), dass `response_type=token`, fehlendes PKCE und `code_challenge_method=plain` mit `302` + `error=...` abgewiesen werden.
3. Hole ein M2M-Token (`client_credentials`) via `-K -`, lade `/.well-known/openid-configuration`, ordne die Header-`kid` im `jwks_uri` zu und inspiziere die Claims via `jq`.

<details>
<summary>Tipp 1 & 2</summary>

Referenzskripte: [m09-pkce-manual.sh](https://github.com/chatelao/api-schulung/blob/main/scripts/curl/m09-pkce-manual.sh), [m10-client-credentials.sh](https://github.com/chatelao/api-schulung/blob/main/scripts/curl/m10-client-credentials.sh), [m11-oidc-discovery-jwt.sh](https://github.com/chatelao/api-schulung/blob/main/scripts/curl/m11-oidc-discovery-jwt.sh)

</details>

---

## Aufgabe A6: Introspection, Revocation & `bru run` in CI

1. Führe den Lifecycle `Token holen → /token/introspect (active: true) → /revoke (RFC 7009) → /token/introspect (active: false)` aus.
2. Starte `collections/bruno/auth-hygiene-lab` (mit `--cacert` und `--client-cert-config`) sowie `collections/bruno/security-audit-suite` per `bru run -r` inklusive `--reporter-skip-headers Authorization`.
3. Führe das vollständige Capstone-Skript `./04-projekte/capstone-hybrid-order/verify-capstone.sh` aus.

<details>
<summary>Tipp 1 & 2</summary>

Referenzskripte: [m12-introspect-revoke.sh](https://github.com/chatelao/api-schulung/blob/main/scripts/curl/m12-introspect-revoke.sh) und [verify-capstone.sh](https://github.com/chatelao/api-schulung/blob/main/04-projekte/capstone-hybrid-order/verify-capstone.sh)

</details>

---

## Selbstkontrolle (Definition of Done — Advanced)

- [ ] Alle 8 Referenzskripte unter `scripts/curl/*.sh` laufen ohne Fehler durch.
- [ ] Keine Klartext-Passwörter oder `-k` / `--insecure` in eigenen `curl`-Kommandos verwendet.
- [ ] `bru run -r` besteht für `petstore-lab`, `auth-hygiene-lab`, `oauth-client-credentials-lab`, `security-audit-suite` und `capstone-hybrid-order` mit Exit-Code `0`.
