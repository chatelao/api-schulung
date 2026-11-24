# Curriculumsplan & Hydrogen-Agenten-Implementierungsspezifikation: `api-schulung`

> **Revision:** v2.0 (Überarbeitet für die autonome Erstimplementierung durch einen **Gemini-4-Hydrogen-Coding-Agenten**, Stand November 2026)  
> **Ziel-Repository:** `chatelao/api-schulung`  
> **Gesamtumfang:** 26,5 Stunden Netto-Lernzeit (1'590 Minuten) — Einstieg (`M00`), 12 Fachmodule (`M01`–`M12`) in 3 Kompetenzstufen sowie 1 Abschlussprojekt (`Capstone`).

Dieser Master-Plan definiert sowohl die **didaktische Architektur** als auch die **deterministische, technisch geprüfte Implementierungsspezifikation** für die Praxis-Schulung **API-Nutzung** (`curl`, **Bruno OpenCollection YAML**, **SoapUI Open Source 5.10.1**, **OpenAPI 3.0/3.1**, **SOAP 1.1/1.2**, **WS-Security**, **OAuth 2.1 / RFC 9700** und **OIDC**).

Gegenüber dem ursprünglichen Roh-Entwurf wurden sämtliche Formatfehler (PDF-Textdump), veraltete bzw. fehlerhafte Container-Tags, die fehlende mTLS-Fähigkeit von `go-httpbin`, die Unterbestimmtheit des SOAP-Services sowie fehlende OpenCollection-YAML-Schemata korrigiert und durch ein ausführbares **Hydrogen-Agenten-Protokoll mit automatisierten Prüfgates** ersetzt.

---

## 1. Review-Ergebnis & Korrekturen gegenüber dem Rohplan (v1 → v2)

Die technische Prüfung des ursprünglichen Plans ergab sieben kritische Korrekturen, die vor der Erstimplementierung durch Hydrogen zwingend berücksichtigt werden müssen:

| # | Befund im Rohplan (v1) | Risiko bei Implementierung | Verbindliche Korrektur in v2 |
| :--- | :--- | :--- | :--- |
| 1 | `quay.io/keycloak/keycloak:26.6.1` | **Kritischer Bug:** Keycloak `26.6.0`/`26.6.1` bricht beim asynchronen `--import-realm` mit Exit-Code 1 ab (`keycloak#48438`) und liefert Admin-Console-404s (`#48566`). | Upgrade auf **`quay.io/keycloak/keycloak:26.8.2`** (stabil, Nov. 2026) inkl. `pkce.code.challenge.method: S256` und Realm-Client-Policy `pkce-enforcer`. |
| 2 | `mccutchen/go-httpbin` direkt auf Port `8443` für mTLS (M07) | **Fehlende Funktion:** `go-httpbin` unterstützt nur einseitiges Server-TLS (`-https-cert-file`), **keine** Client-Zertifikatsprüfung (mTLS), und läuft als Non-Root (`GID 65532`, sodass `chmod 600`-Keys scheitern). | `ghcr.io/mccutchen/go-httpbin:latest` läuft sauber auf HTTP (`8180`). Davor terminiert ein schlanker **`nginx:1.27-alpine`** (`tls-proxy`) **Custom-CA Server-TLS auf Port `8444`** und **striktes mTLS (`ssl_verify_client on`) auf Port `8443`** inkl. `X-Client-Cert-DN`-Header-Weitergabe. |
| 3 | `lab/soap-service/` unspezifiziert (*Specmatic oder SoapUI-Mock oder Python/Node*) | **Halluzinations- & Abbruchrisiko:** Hydrogen muss Architektur raten; WS-Security-Signaturprüfung ist mit einfachen Mocks nicht real umsetzbar. | Verbindliche Spezifikation eines schlanken, selbstenthaltenden **Python-3.12-Containers** (`python:3.12-slim` + `lxml` + `signxml`) auf Port `9000` mit WSDL 1.1/XSD, SOAP 1.1 & 1.2, In-Memory-Order-Store und echter WSS-Prüfung (`Timestamp`, `UsernameToken`, `ds:Signature`). |
| 4 | Bruno OpenCollection YAML ohne konkretes Dateischema | **Schema-Halluzination:** Ohne Vorlage mischen Coding-Agenten oft `.bru`-Schlüssel (`meta`, `bruno.json`) mit YAML. | Verbindliche, verifizierte Referenz-Templates für `opencollection.yml` (`opencollection: 1.0.0`), Request-`.yml`, `environments/*.yml` (`secret: true`) und `client-cert-config.example.json` (`"enabled": true`) in Abschnitt 7. |
| 5 | Bruno CLI Flags unvollständig (`bru run`) | Subfolder-Requests werden ohne `-r` übersprungen; Custom CA fehlt ohne `--cacert`; Reports können Bearer-Tokens leaken. | Verbindliche CLI-Standardaufrufe mit `-r`, `--cacert`, `--client-cert-config`, `--reporter-junit` und `--reporter-skip-headers Authorization`. |
| 6 | `host.docker.internal` in Linux-CI (`verify-labs.yml`) | Auf GitHub-Actions-Linux-Runnern ist `host.docker.internal` standardmässig nicht in `/etc/hosts` aufgelöst. | Klare Trennung: `KC_HOSTNAME_STRICT=false` für lokale CLI/CI-Tests über `localhost:8081` + `extra_hosts: ["host.docker.internal:host-gateway"]` sowie `/etc/hosts`-Schritt im Setup/CI dokumentiert. |
| 7 | Rohplan als PDF-Chat-Prompt (*«Nutze das angehängte PDF ... warte auf Freigabe»*) | Blockiert autonome Agenten-Workflows und hinterlässt ungetestete Artefakte. | Umstellung auf ein **autonomes 3-Wellen-/6-Phasen-Ausführungsprotokoll** mit deterministischen Shell-Prüfgates und sauberer Commit-Strategie. |

---

## 2. Didaktisches Gesamtkonzept, Zielgruppe und Werkzeug-Triangulation

Die Schulung richtet sich an Softwareentwicklerinnen und Softwareentwickler, QA- und Test-Engineers, Systemintegratoren sowie technisch orientierte Business-Analysten, die Schnittstellen nicht nur konsumieren, sondern Verträge lesen, Sicherheitsmechanismen debuggen und Aufrufe reproduzierbar automatisieren müssen.

- **Vorkenntnisse:** Grundlegende Vertrautheit mit Kommandozeile, JSON, XML und elementaren Web-Begriffen (URL, HTTP-Statuscodes, TLS). Einfaches JavaScript (Bruno) und Groovy (SoapUI) werden angeleitet vermittelt.
- **Technischer Stand (November 2026):**
  - OAuth 2.0 Security Best Current Practice: **RFC 9700 (BCP 240, Jan. 2025)**
  - OAuth 2.0 for Browser-Based Applications: **RFC 10017 (2026)**
  - OAuth 2.1 Konsolidierung: **`draft-ietf-oauth-v2-1-17` (Okt. 2026)**
  - Bruno: **v3/v4** mit sortenreinem **OpenCollection YAML (`.yml`, `opencollection: 1.0.0`)** und `@usebruno/cli` (`bru`)
  - SoapUI: **SoapUI Open Source 5.10.1** (transparente Abgrenzung zu kostenpflichtigen ReadyAPI-Features)

### Werkzeug-Triangulation

| Werkzeug | Didaktische Rolle | Stärken im Kurs | Bewusste Abgrenzung |
| :--- | :--- | :--- | :--- |
| **`curl` + `jq`** | Unverfälschte Protokoll-Kontrollinstanz | Macht HTTP-Header, TLS-Handshakes (`-v`), Statuscodes und Token-Austausche ohne GUI-Abstraktion sichtbar | Strenge Secret-Disziplin (`-K -`, `--netrc-file`, `--oauth2-bearer`, kein Klartext-Passwort in Shell-Historie) |
| **Bruno (v3/v4)** | Git-nativer REST/OpenAPI-Client & CI-Runner | Reines OpenCollection YAML (`opencollection.yml`, `*.yml`), PKCE über System-Browser, Collection-Vererbung, `bru import`, `bru run` in CI | Kein Ersatz für komplexe WSDL-/WS-I- und WS-Security-Prüfungen |
| **SoapUI OS 5.10.1** | Vertragsorientierter XML-/WSDL- & Enterprise-Client | WSDL-1.1-Import, WS-I Basic Profile Check, XPath/XQuery Assertions, Property Transfer, MockService, vollständige WS-Security | Keine codelosen Excel/CSV-DataSources, keine automatisierten Browser-OAuth-Skripte (ReadyAPI-only); kein PKCE im nativen OAuth-2-Dialog |

---

## 3. Verbindliche Ziel-Repository-Architektur (`api-schulung`)

Jeder Pfad in diesem Bauplan ist verbindlich (exakte Ordnernamen und Slugs):

```text
api-schulung/
├── README.md
├── CONCEPT.md
├── AGENTS.md
├── ROADMAP.md
├── QUICK-START.md
├── LEARNING-GUIDE.md
├── .gitignore
├── .github/
│   └── workflows/
│       └── verify-labs.yml
├── lab/
│   ├── .env.example
│   ├── docker-compose.yml
│   ├── certs/
│   │   └── generate-certs.sh
│   ├── tls-proxy/
│   │   └── nginx.conf
│   ├── keycloak/
│   │   └── realm-import.json
│   ├── mock-oauth2/
│   │   └── config.json
│   └── soap-service/
│       ├── Dockerfile
│       ├── requirements.txt
│       ├── app.py
│       └── order-service.wsdl
├── 00-setup/
│   ├── README.md
│   └── smoke-test.sh
├── 01-module/
│   ├── M01-http-fundament-curl/README.md
│   ├── M02-openapi-bruno-yaml/README.md
│   ├── M03-soap-wsdl-soapui-curl/README.md          (+ beispiel-payloads/)
│   ├── M04-assertions-chaining-mocking/README.md
│   ├── M05-credentials-secret-hygiene/README.md
│   ├── M06-openapi-security-schemes/README.md       (+ openapi-security-demo.yaml)
│   ├── M07-tls-custom-ca-mtls/README.md
│   ├── M08-soap-ws-security/README.md
│   ├── M09-oauth2-rfc9700-oauth21/README.md
│   ├── M10-oauth-praxis-pkce-m2m/README.md
│   ├── M11-oidc-discovery-jwks-userinfo/README.md
│   └── M12-token-lifecycle-audits-cicd/README.md
├── 02-uebungen/
│   └── M01-uebung.md ... M12-uebung.md
├── 03-loesungen/
│   └── M01-loesung.md ... M12-loesung.md
├── 04-projekte/
│   └── capstone-hybrid-order/
│       ├── README.md
│       ├── RUBRIC.md
│       ├── openapi-hybrid-order.yaml
│       └── verify-capstone.sh
├── collections/
│   └── bruno/
│       ├── petstore-lab/                            (M02, M04)
│       ├── auth-hygiene-lab/                        (M05, M07; inkl. .env.example & client-cert-config.example.json)
│       ├── oauth-pkce-lab/                          (M10, M11)
│       ├── oauth-client-credentials-lab/            (M10, M12)
│       ├── oauth-legacy-ropc-audit/                 (M10 — ausdrücklich als Legacy-Negativbeispiel markiert)
│       ├── security-audit-suite/                    (M12 — 6 automatisierte Negativtests)
│       └── capstone-hybrid-order/                   (Capstone)
│   └── soapui/
│       ├── order-service-soapui-project.xml         (M03, M04)
│       ├── order-service-wss-soapui-project.xml     (M08, Capstone)
│       └── oauth-contrast-soapui-project.xml        (M10)
└── scripts/
    └── curl/
        ├── m01-petstore-crud.sh
        ├── m03-soap-call.sh
        ├── m05-auth-hygiene.sh
        ├── m07-mtls-test.sh
        ├── m09-pkce-manual.sh
        ├── m10-client-credentials.sh
        ├── m11-oidc-discovery-jwt.sh
        └── m12-introspect-revoke.sh
```

---

## 4. Reproduzierbare Laborumgebung (`lab/docker-compose.yml`)

### 4.1 Verbindliche Service- und Port-Matrix

Alle Beispiele in Texten, Skripten, Bruno-Collections und SoapUI-Projekten **müssen exakt** diese Ports und Hostnamen verwenden:

| Service-Name (`compose`) | Image / Build | Host-Port | Kern-Endpunkte & Zweck | Besonderheiten / Konfiguration |
| :--- | :--- | :--- | :--- | :--- |
| `petstore3` | `swaggerapi/petstore3:latest` | `8080` | `http://localhost:8080/api/v3/openapi.json`, Swagger UI, CRUD `/api/v3/pet`, `/store/order`, `/user` | In-Memory, zustandslos; Basis für M01, M02, M04, Capstone |
| `go-httpbin` | `ghcr.io/mccutchen/go-httpbin:latest` | `8180` | `http://localhost:8180/status/200`, `/headers`, `/basic-auth/{u}/{p}`, `/digest-auth/...`, `/bearer` | Intern Port `8080` → Host `8180`; kein direktes TLS im Container (Non-Root-Problem vermieden) |
| `tls-proxy` | `nginx:1.27-alpine` | `8443` (mTLS) / `8444` (Custom-CA TLS) | `https://localhost:8444/headers` (Server-TLS mit Custom CA) und `https://localhost:8443/headers` (mTLS erzwingt gültiges Client-Zertifikat) | Leitet an `http://go-httpbin:8080` weiter; setzt `X-Client-Cert-DN` und `X-Client-Cert-Verify`; liest Zertifikate read-only aus `./certs/out` |
| `soap-service` | `./soap-service` (`python:3.12-slim`) | `9000` | `GET http://localhost:9000/soap?wsdl`, `POST /soap` (SOAP 1.1 & 1.2), `POST /soap/secure` (WS-Security) | WSDL 1.1 + XSD, Operationen `CreateOrder`, `GetOrder`, `CalculateTax`, `CreateSecureOrder`; XSD-Faults; echte WSS-Prüfung (Timestamp, UsernameToken Text/Digest, XML-Signatur via `signxml`) |
| `keycloak` | `quay.io/keycloak/keycloak:26.8.2` | `8081` | `http://localhost:8081/realms/api-lab/.well-known/openid-configuration`, `/auth`, `/token`, `/userinfo`, `/certs`, `/token/introspect`, `/revoke` | `start-dev --import-realm`; `KC_HOSTNAME_STRICT=false`; importiert `./keycloak/realm-import.json`; Healthcheck via `/realms/api-lab/.well-known/openid-configuration` |
| `mock-oauth2` | `ghcr.io/navikt/mock-oauth2-server:6.1.1` | `8090` | `http://localhost:8090/isalive`, `/default/.well-known/openid-configuration`, `/default/authorize`, `/default/token`, `/default/jwks`, `/default/debugger` | `JSON_CONFIG_PATH=/config/config.json`; `interactiveLogin: true`, Custom Claims, kurze `expiry`; ideal für Low-RAM-Setups & schnelle CI-Tests |

> **Netzwerk-Hinweis (`host.docker.internal`):**
> - Für lokale Browser-Flows und Container-zu-IdP-Aufrufe erhält `docker-compose.yml` `extra_hosts: ["host.docker.internal:host-gateway"]`.
> - Unter Linux dokumentiert `00-setup/README.md` den einmaligen Eintrag `127.0.0.1 host.docker.internal` in `/etc/hosts`.
> - Dank `KC_HOSTNAME_STRICT=false` funktionieren sowohl `http://localhost:8081` (CLI/CI ohne `/etc/hosts`-Eingriff) als auch `http://host.docker.internal:8081` (konsistente Browser↔Container-Issuer-URLs) reibungslos.

### 4.2 Zertifikats-Generator (`lab/certs/generate-certs.sh`)

Das Skript erzeugt deterministisch und idempotent unter `lab/certs/out/` (komplett in `.gitignore`):
1. **Root-CA:** `ca.key`, `ca.crt` (CN=`API-Schulung Lab Root CA`, 825 Tage).
2. **Server-Zertifikat:** `server.key`, `server.crt` mit **SANs** `DNS:localhost,DNS:host.docker.internal,DNS:tls-proxy,IP:127.0.0.1`.
3. **Client-Zertifikat (mTLS & WS-Security):**
   - `client.key` (unverschlüsselt für `curl`/CI) + `client.crt` (CN=`api-lab-client`)
   - `client.pfx` (PKCS#12, Passwort aus `LAB_CERT_PASSWORD`, Standard-Platzhalter `CHANGE_ME_LAB_ONLY`)
   - `client-keystore.jks` und `lab-truststore.jks` (erzeugt via `keytool` für **SoapUI OS 5.10.1** in M07 & M08; falls `keytool` lokal fehlt, Hinweis ausgeben, aber PEM/PFX trotzdem erzeugen).
4. **Dateiberechtigungen:** `chmod 644` auf `.crt`-Dateien und lesbare Rechte für den `nginx`-Container auf `server.key` (`chmod 644` im isolierten lokalen Lab-Ordner mit klarem Kommentar: *nur für lokales Docker-Lab, niemals in Produktion*).

### 4.3 Keycloak Realm (`lab/keycloak/realm-import.json`)

Realm `api-lab` mit exakt vier vorkonfigurierten Clients und zwei Testbenutzern (alle Geheimnisse als offensichtliche Labor-Platzhalter, synchron zu `lab/.env.example`):

| Client-ID | Typ | Grant / Flow | Sicherheits-Konfiguration | Verwendung |
| :--- | :--- | :--- | :--- | :--- |
| `bruno-pkce-client` | Public | Authorization Code + **PKCE `S256` zwingend** | `standardFlowEnabled: true`, `implicitFlowEnabled: false`, `directAccessGrantsEnabled: false`, Attribut `pkce.code.challenge.method: S256`, exakte Redirect-URIs (`http://localhost:8080/callback`, `https://oauth.usebruno.com/callback`, `http://localhost:12345/callback`) | M09, M10, M11, Capstone |
| `m2m-service-client` | Confidential | Client Credentials | `serviceAccountsEnabled: true`, `standardFlowEnabled: false`, `directAccessGrantsEnabled: false`, Secret `CHANGE_ME_LAB_M2M_SECRET` | M10, M12, Capstone |
| `soapui-lab-client` | Confidential | Authorization Code (Kontrast) / Client Credentials | `standardFlowEnabled: true`, `serviceAccountsEnabled: true`, Secret `CHANGE_ME_LAB_SOAPUI_SECRET` | M10 (SoapUI-Kontrast) |
| `legacy-ropc-audit-client` | Confidential | **Legacy ROPC (nur Audit/Negativbeispiel)** | `directAccessGrantsEnabled: true`, Beschreibung: `DEPRECATED - NUR FUER MIGRATIONS-AUDIT IN M10` | M09/M10 Kontrast |

Testbenutzer im Realm `api-lab`:
- `alice` (Passwort `CHANGE_ME_LAB_USER_PASS`, Rolle `api-user`, E-Mail `alice@api-lab.local`)
- `bob-admin` (Passwort `CHANGE_ME_LAB_ADMIN_PASS`, Rollen `api-user`, `api-admin`, E-Mail `bob@api-lab.local`)

Zusätzlich aktiviert der Realm eine **Client Policy (`pkce-enforcer`)** bzw. strikte Client-Attribute, sodass Requests ohne `code_challenge` oder mit `response_type=token` am Client `bruno-pkce-client` nachweisbar mit HTTP `400` abgelehnt werden.

### 4.4 Lokaler SOAP 1.1/1.2 + WS-Security Service (`lab/soap-service/`)

Konkreter Python-Service (`app.py`, Standard-HTTP-Server oder `uvicorn`/`starlette` + `lxml` + `signxml`):
- **`GET /soap?wsdl`** (und `/wsdl`): Liefert eine **WS-I Basic Profile 1.1**-konforme WSDL 1.1 (`order-service.wsdl`, Document/Literal Wrapped) mit eingebettetem XSD-Schema und vier Operationen:
  1. `CreateOrder(customerId: string, itemCode: string, quantity: positiveInteger, netAmount: decimal)` → `CreateOrderResponse(orderId, status, totalAmount)`
  2. `GetOrder(orderId: string)` → `GetOrderResponse(orderId, customerId, itemCode, quantity, totalAmount, status)` (liests aus In-Memory-Store → echtes Chaining in M04!)
  3. `CalculateTax(netAmount: decimal, countryCode: string)` → `CalculateTaxResponse(taxRate, taxAmount, grossAmount)`
  4. `CreateSecureOrder(...)` → identische Fachlogik, erfordert aber gültige WS-Security-Header!
- **`POST /soap`**:
  - Erkennt **SOAP 1.1** (`Content-Type: text/xml` + `SOAPAction`-Header; prüft fehlende/falsche `SOAPAction`) und **SOAP 1.2** (`Content-Type: application/soap+xml`).
  - Validiert den `<soap:Body>`-Inhalt streng gegen das XSD-Schema (`lxml.etree.XMLSchema`) und liefert bei Typfehlern (z. B. `quantity = "abc"`) einen normgerechten **SOAP 1.1 Fault** (`soap:Client`, `faultcode`/`faultstring`) bzw. **SOAP 1.2 Fault** (`soap:Sender`, `soap:Code`/`soap:Reason`) mit HTTP `500`.
- **`POST /soap/secure`**:
  - Prüft zwingend `<wsse:Security>` im `<soap:Header>`:
    1. `wsu:Timestamp`: Prüft `Created` und `Expires` (lehnt abgelaufene Timestamps ab!).
    2. `wsse:UsernameToken`: Unterstützt `PasswordText` und `PasswordDigest` (`Base64(SHA1(Nonce + Created + Password))`) gegen Labor-Credentials aus Env-Vars (`SOAP_WSS_USER` / `SOAP_WSS_PASS`).
    3. `ds:Signature` (wenn im Header vorhanden oder wenn `?requireSignature=true` / Operation `CreateSecureOrder`): Verifiziert die XML-Signatur über `<soap:Body>` (und optional `wsu:Timestamp`) per `signxml` gegen `/certs/client.crt` (bzw. `/certs/ca.crt`). Jede 1-Zeichen-Manipulation am Body führt nachweisbar zu einem `wsse:FailedCheck` SOAP-Fault!

### 4.5 Dokumentierte öffentliche Fallback-Sandboxes

Für Ad-hoc-Demos ohne lokales Docker (stets mit Datenschutzhinweis: *niemals echte Secrets senden!*):
- OpenAPI 3.0 REST: `https://petstore3.swagger.io/api/v3/openapi.json`
- SOAP 1.1 & REST kombiniert: `https://demo.totalshiftleft.ai/soap?wsdl`
- Klassische WSDL-Übungsdienste: NumberConversion (`https://www.dataaccess.com/webservicesserver/numberconversion.wso?WSDL`), CountryInfo (`http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL`), Calculator (`http://www.dneonline.com/calculator.asmx?wsdl`)

---

## 5. Detailliertes Modul-Curriculum (1'590 Minuten / 26,5 Stunden)

| Modul | Titel | Stufe | Dauer | Primäre Werkzeuge | Kernprotokolle & Standards |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **M00** | Labor-Setup, Werkzeug-Check & Smoke-Tests | Einstieg | 45 Min | Docker, curl, Bruno, SoapUI | Lokaler Container-Stack, Zertifikate, CLI-Checks |
| **M01** | HTTP-Fundament & curl ohne Magie | Stufe 1 | 90 Min | curl, jq | HTTP/1.1 & HTTP/2, Verben, Header, Statuscodes, `--json`, JSON |
| **M02** | Swagger / OpenAPI (2.0, 3.0, 3.1) lesen & mit Bruno nutzen | Stufe 1 | 120 Min | Bruno (YAML & CLI), curl | OpenAPI 3.0/3.1, JSON Schema, OpenCollection YAML |
| **M03** | SOAP 1.1/1.2 & WSDL-Verträge in SoapUI und curl | Stufe 1 | 150 Min | SoapUI OS 5.10.1, curl | WSDL 1.1, XSD, SOAP 1.1 vs. 1.2, WS-I, Faults, `--data-binary` |
| **M04** | Assertions, Request-Chaining, Scripting & Mocking | Stufe 1 | 120 Min | Bruno, SoapUI OS 5.10.1 | Chai-Tests, `bru.setVar` vs. `setEnvVar`, XPath/XQuery, Property Transfer, MockService |
| **M05** | Klassische Credentials & Secret-Hygiene | Stufe 2 | 90 Min | curl, Bruno, SoapUI | Basic, Digest, API-Keys, `.env`, `.gitignore`, `-K -`, `--netrc-file` |
| **M06** | OpenAPI `securitySchemes` & kombinierte Anforderungen | Stufe 2 | 75 Min | Bruno, OpenAPI-Editor | `apiKey`, `http`, `mutualTLS`, `oauth2`, `openIdConnect`, AND/OR, `{}`, `[]`, Ausblick 3.2 |
| **M07** | TLS, Custom Certificate Authorities & Mutual TLS (mTLS) | Stufe 2 | 105 Min | curl, Bruno (GUI/CLI), SoapUI | X.509, PEM/PFX/JKS, Custom CA (`--cacert`), mTLS (`--client-cert-config`), Port `8444` vs `8443` |
| **M08** | SOAP WS-Security (WSS): UsernameToken, Signatur & Verschlüsselung | Stufe 2 | 120 Min | SoapUI OS 5.10.1 | WS-Security, Keystore/Truststore, Timestamp, UsernameToken Digest, XML-Signatur/Enc. |
| **M09** | OAuth 2.0 vs. RFC 9700 & OAuth 2.1: Architektur & Anti-Patterns | Stufe 3 | 120 Min | Architektur, curl | RFC 6749, RFC 9700 (BCP 240), RFC 10017, OAuth 2.1 Draft-17, PKCE `S256` |
| **M10** | OAuth-Praxis: Authorization Code + PKCE & Client Credentials | Stufe 3 | 135 Min | Bruno, curl, SoapUI | Keycloak / mock-oauth2-server, Token-Inheritance, Refresh, SoapUI-OS-Abgrenzung |
| **M11** | OpenID Connect (OIDC): Discovery, JWKS, ID Token & `/userinfo` | Stufe 3 | 120 Min | curl, jq, Bruno | OIDC 1.0, `/.well-known/openid-configuration`, JWT, JWKS, ID- vs. Access-Token-Trennung |
| **M12** | Token-Lebenszyklus, Sicherheits-Audits & CI/CD-Automatisierung | Stufe 3 | 120 Min | curl, Bruno CLI, GitHub Actions | RFC 7662 (Introspection), RFC 7009 (Revocation), RFC 8705/9449 (mTLS/DPoP), `bru run -r` |
| **CAP** | Abschlussprojekt: Hybride Enterprise-Auftragsintegration | Projekt | 180 Min | curl, Bruno, SoapUI | OIDC + OpenAPI REST + mTLS + SOAP/WSS + CI-Lauf + Revocation + Hygiene-Audit |

**Rechenkontrolle:** `45 + (90+120+150+120) + (90+75+105+120) + (120+135+120+120) + 180 = 45 + 480 + 390 + 495 + 180 = 1'590 Min = 26,5 h`.

### Kernanforderungen pro Modul (Kurzfassung der Praxis-Abnahmekriterien)

- **M00:** `generate-certs.sh`, `docker compose up -d`, `00-setup/smoke-test.sh` meldet `200 OK` für alle 6 Endpunkte; `bru --version` erfolgreich; `.env` in `.gitignore` geprüft.
- **M01:** CRUD gegen `petstore3` (`8080`) und Echo/Status-Tests gegen `go-httpbin` (`8180`); Bash-Skript `scripts/curl/m01-petstore-crud.sh` mit `curl --json` + `jq`.
- **M02:** Inspektion `http://localhost:8080/api/v3/openapi.json`; Import via Bruno GUI & CLI (`bru import openapi ... --collection-format=opencollection`); Environment `local` mit `{{baseURL}}`; 4 Operationen grün.
- **M03:** WSDL-Import (`http://localhost:9000/soap?wsdl`) in SoapUI OS 5.10.1, WS-I Basic Profile Check, identischer Aufruf per `curl --data-binary @...`, provozierter SOAP 1.1 & 1.2 XSD-Fault, Ausblick `bru import wsdl`.
- **M04:** Bruno-Chaining (`POST → ID → GET`) mit `bru.setVar()` (vs. `bru.setEnvVar()`-Persistenz-Fallstrick) & `bru run -r --env local`; SoapUI TestSuite → TestCase (`CreateOrder → Property Transfer (XPath) → GetOrder`) + SOAP MockService; klare Abgrenzung ReadyAPI-DataSource.
- **M05:** Basic, Digest, `X-Api-Key`, Bearer gegen `go-httpbin` (`8180`) via `curl -K -` / `--netrc-file` / `--oauth2-bearer` und Bruno `secret: true` / `.env`; `git status` + Grep belegt 0 Klartext-Secrets.
- **M06:** OpenAPI-3.1-Datei (`openapi-security-demo.yaml`) mit 4 Fällen: `/health` (`security: []`), Lese-Endpunkt (`apiKey` ODER `bearerAuth`), optionaler Katalog (`{}` ODER `apiKey`), Admin (`mutualTLS` UND `oauth2`); Ausblick OpenAPI 3.2 (`oauth2MetadataUrl`, `deviceAuthorization`).
- **M07:** Schritt 1 Custom CA Trust (`https://localhost:8444` mit `--cacert`, niemals `-k`); Schritt 2 Mutual TLS (`https://localhost:8443` mit `--cert`/`--key` in `curl`, `bru run --cacert ... --client-cert-config ...` und SoapUI Keystore/Truststore) + Negativtest ohne Client-Cert (TLS-Handshake-Abbruch!).
- **M08:** 7-Schritte-Workflow in SoapUI OS 5.10.1 gegen `http://localhost:9000/soap/secure`: Keystore/Truststore (`Status: OK`), Outgoing-WSS-Reihenfolge (Timestamp → UsernameToken mit Nonce/Created/Digest → Signature), Incoming-WSS, WS-Security Status Assertion, Negativtest durch 1-Zeichen-Body-Manipulation.
- **M09:** 4 OAuth-Rollen, RFC 9700 & OAuth 2.1 Draft-17 & RFC 10017; Skript `scripts/curl/m09-pkce-manual.sh` berechnet `code_verifier` + `S256` `code_challenge`, provoziert Token-Ablehnung bei manipuliertem Verifier sowie Ablehnung von `response_type=token` / fehlendem PKCE am Keycloak-Client `bruno-pkce-client`.
- **M10:** 3 Bruno-Collections (`oauth-pkce-lab`, `oauth-client-credentials-lab`, `oauth-legacy-ropc-audit` warnend markiert), Token-Vererbung, `{{$oauth2.<id>.access_token}}`, `bru.resetOauth2Credential()`; `curl` M2M-Skript (`-K -`); SoapUI-OS-Kontrast (Bearer-Header, keine Query-Params, ehrliche PKCE-Grenze).
- **M11:** Discovery (`/.well-known/openid-configuration`), JWKS (`kid`-Zuordnung), Base64URL-Dekodierung per `jq` (**Dekodieren ≠ Verifizieren**), strikte Trennung ID Token vs. Access Token, `/userinfo`-Aufruf, `type: openIdConnect` in OpenAPI 3.1.
- **M12:** Introspection (RFC 7662: `active: true`) → Revocation (RFC 7009) → Introspection (`active: false`); Sender-Constrained Tokens (mTLS RFC 8705, DPoP RFC 9449); 6 automatisierte Security-Audit-Negativtests (`security-audit-suite`) per `bru run -r --env ci --reporter-junit ... --reporter-skip-headers Authorization`.
- **Capstone:** End-to-End über OIDC/OAuth 2.1 → OpenAPI 3.1 REST + mTLS (`8443`) + Petstore (`8080`) → SOAP/WSS (`9000/soap/secure`) → `bru run` CI-Lauf → Token-Revocation → Secret-Hygiene-Abnahme inkl. `RUBRIC.md` und `verify-capstone.sh`.

---

## 6. Diagnose- und Troubleshooting-Matrix (Pflichtreferenz für Module)

| Fehlerbild / Symptom | Häufigste Grundursache | Diagnose & Fix im Kurs |
| :--- | :--- | :--- |
| `401 Unauthorized` vs. `403 Forbidden` | `401`: Identität fehlt, Token abgelaufen oder Signatur ungültig; `403`: Identität gültig, aber fehlender `scope` oder falsche `aud`/Rolle | `curl -v` (`WWW-Authenticate`-Header prüfen) + JWT-Payload (`exp`, `scope`, `aud`) per `jq` dekodieren |
| Bruno sendet leere Variable `{{token}}` | Kein Environment gewählt, `secret: true` ohne CLI `--env-var` oder Verwechslung `bru.setVar()` vs. `bru.setEnvVar()` | `--env local` explizit angeben, Secrets per `--env-var` / `.env` injizieren, bei OAuth `{{$oauth2.<id>.access_token}}` nutzen |
| Bruno erkennt Collection nicht oder Dateien verschwinden | Fehlendes `opencollection: 1.0.0` in `opencollection.yml` oder Mischung aus `.bru` und `.yml` | Sortenreines OpenCollection YAML mit `opencollection.yml` im Collection-Root |
| mTLS klappt in Bruno GUI, schlägt in `bru run` fehl | Bruno CLI liest keine globalen GUI-Preferences aus oder `"enabled": true` fehlt in `client-cert-config.json` | Explizit `bru run -r --cacert ... --client-cert-config ...` nutzen |
| SOAP-Server meldet `500` / `soap:Client` / Action-Fehler | Falscher `Content-Type` (`text/xml` vs. `application/soap+xml`), fehlender `SOAPAction`-Header (SOAP 1.1) oder falscher Namespace | SoapUI Raw-Tab mit `curl -v --data-binary` zeilenweise vergleichen |
| WS-Security trotz korrekter Credentials abgelehnt | Falsche Reihenfolge der Outgoing-WSS-Einträge (Signatur vor Timestamp), abgelaufener TTL (Clock Skew) oder Keystore-Status ≠ `OK` | Reihenfolge Timestamp → UsernameToken → Signature prüfen, Container-Zeit & WSS Inspector kontrollieren |
| OAuth-Browser-Login klappt, aber Issuer-Check scheitert | Browser nutzt `localhost`, Container nutzt `keycloak` → `iss` stimmt nicht überein | `host.docker.internal` (inkl. `/etc/hosts` unter Linux) oder konsistente `KC_HOSTNAME`-Konfiguration |
| OIDC-Discovery klappt in `curl`, scheitert im Browser | CORS-Restriktion des IdP oder falscher Realm-Pfad (`404`) | Exakte Issuer-URL prüfen; Unterschied CLI vs. Browser-Origin erklären |

---

## 7. Ausführungsprotokoll & Technische Referenz für den Hydrogen-Agenten

Dieser Abschnitt ist die **direkte Handlungsanweisung** für einen **Gemini-4-Hydrogen-Coding-Agenten** zur autonomen Erstimplementierung des Repositories.

### 7.1 Verbindlicher Content Contract (jedes Modul & jede Übung)

Jede `01-module/Mxx-slug/README.md` und `02-uebungen/Mxx-uebung.md` beginnt mit diesem YAML-Frontmatter:

```yaml
---
module_id: M10
title: "OAuth-Praxis: Authorization Code + PKCE & Client Credentials"
level: "Stufe 3 - Experten"
duration_minutes: 135
tools: ["Bruno (OpenCollection YAML)", "curl", "SoapUI Open Source 5.10.1"]
standards: ["RFC 9700", "OAuth 2.1 (Draft-17)", "RFC 7636 (PKCE)"]
lab_services: ["keycloak", "mock-oauth2", "petstore3"]
prerequisites: ["M05", "M09"]
---
```

- **Pflichtabschnitte `01-module/Mxx-slug/README.md`:** (1) Lernziele (3–5 Bloom-Kompetenzen), (2) Architektur & Kernkonzepte (inkl. ≥ 1 Vergleichstabelle), (3) Geführter Walkthrough (getrennt nach `curl`, `Bruno` und ggf. `SoapUI`), (4) Typische Fallstricke & Troubleshooting (≥ 3 Fehlerbilder), (5) Spickzettel (Cheat Sheet), (6) Querverweise (`../../02-uebungen/Mxx-uebung.md` und `../../03-loesungen/Mxx-loesung.md`).
- **Pflichtabschnitte `02-uebungen/Mxx-uebung.md`:** (1) Szenario & Zielzustand, (2) Aufgabenpakete A–C + Bonus-Challenge D, (3) Gestufte Hilfestellungen (`<details>` Tipp 1 konzeptionell, Tipp 2 konkret), (4) Selbstkontrolle (*Definition of Done* als Checkbox-Liste).
- **Keine Auslassungen:** Niemals Platzhalter wie `... rest wie gehabt` oder `TODO` in generierten Dateien hinterlassen.

### 7.2 Verifizierte OpenCollection-YAML-Referenzschemata (Anti-Halluzination!)

Jede Bruno-Collection unter `collections/bruno/<name>/` **muss exakt** dieses Schema verwenden (keine `.bru`-Dateien, kein `bruno.json`):

**1. Collection-Root (`opencollection.yml`):**
```yaml
opencollection: 1.0.0
info:
  name: Petstore Lab
config:
  proxy:
    inherit: true
```

**2. Environment (`environments/local.yml`):**
```yaml
name: local
variables:
  - name: baseURL
    value: http://localhost:8080/api/v3
  - name: apiKey
    value: ""
    secret: true
```

**3. HTTP-Request (`01-create-pet.yml`):**
```yaml
info:
  name: Create Pet
  type: http
  seq: 1
  tags:
    - smoke
http:
  method: POST
  url: "{{baseURL}}/pet"
  headers:
    - name: Content-Type
      value: application/json
  body:
    type: json
    data: |-
      {
        "id": 1001,
        "name": "Bello",
        "status": "available"
      }
  auth: inherit
runtime:
  assertions:
    - expression: res.status
      operator: eq
      value: "200"
  scripts:
    - type: after-response
      code: |-
        bru.setVar("petId", res.body.id);
    - type: tests
      code: |-
        test("Pet wurde angelegt", function() {
          expect(res.status).to.equal(200);
          expect(res.body.id).to.equal(1001);
        });
settings:
  encodeUrl: true
  timeout: 5000
  followRedirects: true
  maxRedirects: 5
```

**4. CLI Client-Cert-Config (`client-cert-config.example.json`):**
```json
{
  "enabled": true,
  "certs": [
    {
      "domain": "localhost",
      "type": "cert",
      "certFilePath": "../../../lab/certs/out/client.crt",
      "keyFilePath": "../../../lab/certs/out/client.key",
      "passphrase": ""
    }
  ]
}
```

**5. Standard-CLI-Aufrufe (immer mit `cwd` = Collection-Root!):**
```bash
# Rekursiver Lauf ohne mTLS
bru run -r --env local --reporter-junit ../../reports/junit.xml --reporter-skip-headers Authorization

# Rekursiver Lauf mit Custom CA + mTLS (M07 / Capstone / CI)
bru run -r --env local \
  --cacert ../../../lab/certs/out/ca.crt \
  --client-cert-config ./client-cert-config.json \
  --env-var "apiKey=${LAB_API_KEY}" \
  --reporter-skip-headers Authorization
```

### 7.3 Autonomer 3-Wellen- / 6-Phasen-Implementierungsplan mit Prüfgates

Der Hydrogen-Agent arbeitet die sechs Phasen **autonom und sequenziell** ab, führt nach jeder Phase das definierte **Verifikationsgate** aus, behebt eventuelle Fehler sofort und erstellt pro abgeschlossener Phase einen sauberen Git-Commit.

| Welle | Phase | Zu erstellende Artefakte | Verbindliches Automatisches Prüfgate (vor Weiterarbeit!) |
| :--- | :--- | :--- | :--- |
| **Welle 1: Fundament & Lauffähiges Labor** | **Phase 1** | `.gitignore`, `AGENTS.md`, `README.md`, `CONCEPT.md`, `ROADMAP.md`, `QUICK-START.md`, `LEARNING-GUIDE.md` | Alle 7 Root-Dateien vorhanden; Port-Matrix konsistent (`8080`, `8081`, `8090`, `8180`, `8443`, `8444`, `9000`); keine Klartext-Secrets. |
| **Welle 1: Fundament & Lauffähiges Labor** | **Phase 2** | `lab/.env.example`, `lab/docker-compose.yml`, `lab/certs/generate-certs.sh`, `lab/tls-proxy/nginx.conf`, `lab/keycloak/realm-import.json`, `lab/mock-oauth2/config.json`, `lab/soap-service/*`, `00-setup/README.md`, `00-setup/smoke-test.sh` | `bash -n` auf allen `.sh`; `python3 -m py_compile lab/soap-service/app.py`; JSON/YAML-Syntaxcheck; `docker compose -f lab/docker-compose.yml --env-file lab/.env.example config -q`; `./lab/certs/generate-certs.sh` erzeugt gültige CA/Server/Client-Certs (SAN-Check via `openssl x509 -text`); wenn Docker-Daemon aktiv: Stack starten & `./00-setup/smoke-test.sh` grün! |
| **Welle 2: Fachmodule & Collections** | **Phase 3 (Stufe 1: M01–M04)** | `01-module/M01..M04`, `02-uebungen/M01..M04`, `03-loesungen/M01..M04`, `collections/bruno/petstore-lab/`, `collections/soapui/order-service-soapui-project.xml`, `scripts/curl/m01-*.sh`, `m03-*.sh` | `bash -n scripts/curl/*.sh`; YAML-Parsecheck auf allen `.yml`; XML-Well-Formedness auf `*.xml`; `find collections/bruno -name "*.bru"` = leer; Frontmatter- & Pflichtabschnitts-Check. |
| **Welle 2: Fachmodule & Collections** | **Phase 4 (Stufe 2: M05–M08)** | `01-module/M05..M08`, `02-uebungen/M05..M08`, `03-loesungen/M05..M08`, `01-module/M06-.../openapi-security-demo.yaml`, `collections/bruno/auth-hygiene-lab/` (inkl. `.env.example`, `client-cert-config.example.json`), `collections/soapui/order-service-wss-soapui-project.xml`, `scripts/curl/m05-*.sh`, `m07-*.sh` | `bash -n`; OpenAPI-3.1-YAML valide; kein `curl -k` / `--insecure` als Positiv-Empfehlung; kein Klartext-Passwort in `curl -u user:pass`; `client-cert-config.example.json` enthält `"enabled": true`. |
| **Welle 2: Fachmodule & Collections** | **Phase 5 (Stufe 3: M09–M12)** | `01-module/M09..M12`, `02-uebungen/M09..M12`, `03-loesungen/M09..M12`, `collections/bruno/oauth-pkce-lab/`, `oauth-client-credentials-lab/`, `oauth-legacy-ropc-audit/`, `security-audit-suite/`, `collections/soapui/oauth-contrast-soapui-project.xml`, `scripts/curl/m09..m12-*.sh` | `bash -n`; PKCE-Check (`S256`, niemals `plain`); kein `?access_token=`; kein ID-Token als API-Bearer; alle 6 Security-Audit-Negativtests vorhanden; YAML/XML valide. |
| **Welle 3: Capstone & CI** | **Phase 6** | `04-projekte/capstone-hybrid-order/` (`README.md`, `RUBRIC.md`, `openapi-hybrid-order.yaml`, `verify-capstone.sh`), `collections/bruno/capstone-hybrid-order/`, `.github/workflows/verify-labs.yml` | Gesamt-Audit-Skript: (1) alle 12 Module + 12 Übungen + 12 Lösungen + Capstone vorhanden, (2) 0 `.bru`-Dateien, (3) 0 getrackte `.env`/`.key`/`.pem`/`.crt`/`.pfx`/`.jks`, (4) alle `.sh`, `.yml`, `.json`, `.xml`, `.py` syntaktisch valide, (5) `verify-labs.yml` syntaktisch valide und testet `bru import`, `bru run -r` und `curl`-Smoke-Tests. |

### 7.4 Verbindliche Anti-Halluzinations-Leitplanken (Kurzcheck für jede Phase)

1. **Keine echten Geheimnisse:** Nur offensichtliche Labor-Platzhalter (`CHANGE_ME_LAB_*`) in `.env.example` / `realm-import.json`; `.env`, `*.key`, `*.pem`, `*.crt`, `*.pfx`, `*.p12`, `*.jks`, `client-cert-config.json` in `.gitignore`.
2. **Sortenreines OpenCollection YAML:** Ausschliesslich `.yml` mit `opencollection.yml` (`opencollection: 1.0.0`) unter `collections/bruno/`; niemals `.bru` mischen.
3. **SoapUI OS 5.10.1 ehrlich abgrenzen:** Niemals ReadyAPI-Pro-Features (Excel-DataSource-Loops, automatisierte Browser-OAuth-Skripte, Form-View, automatisches WSDL-Refactoring) als Open-Source-Features beschreiben.
4. **OAuth 2.1 / RFC 9700 konform:** Immer PKCE `S256` (niemals `plain`); Implicit & ROPC nur als explizit warnend gekennzeichnete Legacy-Audits; niemals `?access_token=` in Query-Strings.
5. **ID Token ≠ Access Token:** Niemals ID Token als `Authorization: Bearer` an Fach-APIs senden; `jq`-Dekodierung stets als *Inspektion ≠ Verifikation* kennzeichnen.
6. **Sichere `curl`-Aufrufe:** Credentials via `-K -` / `--netrc-file` / Env-Vars; XML/SOAP via `--data-binary @datei.xml`; TLS-Vertrauen via `--cacert` statt `-k`.
7. **Exakte Ports:** Petstore `8080`, Keycloak `8081`, mock-oauth2 `8090`, go-httpbin `8180`, tls-proxy mTLS `8443` / Custom-CA `8444`, SOAP `9000`.
8. **Sprache:** Klares, professionelles Deutsch; englische Protokoll- und Fachbegriffe (`Endpoint`, `Header`, `Bearer Token`, `WSDL`, `XPath`, `Assertion`, `Keystore`) im Original belassen.

---

## 8. Direkt nutzbarer Kickoff-Prompt für den Hydrogen-Agenten

Kopiere den folgenden Prompt unverändert als Arbeitsauftrag für die **erste Implementierung** durch den **Gemini-4-Hydrogen-Agenten** im Repository `api-schulung`:

```text
Implementiere das Schulungs-Repository `api-schulung` vollständig anhand von `first-goal.md` (Version v2.0).

Arbeitsweise:
1. Lies `first-goal.md` und `AGENTS.md` vollständig ein und halte alle acht Anti-Halluzinations-Leitplanken (Abschnitt 7.4), den Content Contract (Abschnitt 7.1), die exakte Port-Matrix (Abschnitt 4.1) und die verifizierten OpenCollection-YAML-Schemata (Abschnitt 7.2) ausnahmslos ein.
2. Arbeite das autonome 3-Wellen-/6-Phasen-Protokoll (Abschnitt 7.3) sequenziell von Phase 1 bis Phase 6 ab. Warte NICHT auf Zwischenfreigaben, sondern führe nach jeder Phase das definierte automatische Prüfgate (Syntax-, Schema-, Secret-, Docker-Compose- und Skript-Checks) direkt per Terminal aus und behebe Fehler sofort, bevor du zur nächsten Phase übergehst.
3. Schreibe jede Datei vollständig ohne Auslassungen oder Platzhalter ("... rest wie gehabt").
4. Erstelle nach jeder bestandenen Phase einen klaren, atomaren Git-Commit (z. B. `feat(phase-1): repository foundation`, `feat(phase-2): docker lab and soap wss service`, ..., `feat(phase-6): capstone and ci workflow`).
5. Falls ein Docker-Daemon und `@usebruno/cli` in deiner Umgebung verfügbar sind, starte am Ende von Phase 2 und Phase 6 das Labor tatsächlich, führe `./lab/certs/generate-certs.sh`, `./00-setup/smoke-test.sh` sowie die `bru run`-Suites aus und protokolliere die echten Testergebnisse in deinem Abschlussbericht. Falls Docker in der Sandbox nicht verfügbar ist, führe alle statischen und lokalen Python-/Shell-/YAML-/JSON-/XML-Verifikationen aus und markiere Laufzeittests transparent als offen.
```
