# CONCEPT.md — Didaktisches Leitkonzept und Architektur-Entscheidungen

## 1. Zielgruppe und Lernziel-Taxonomie

Die Schulung richtet sich an Softwareentwicklerinnen und Softwareentwickler, QA- und Test-Engineers, Systemintegratoren sowie technisch orientierte Business-Analysten, die Schnittstellen nicht nur konsumieren, sondern deren Verträge lesen, Sicherheitsmechanismen debuggen und Aufrufe reproduzierbar automatisieren müssen.

Das Curriculum folgt einer dreistufigen Kompetenzprogression nach Bloom:

1. **Stufe 1 — Grundlagen (M01–M04, 8,0 h):** Protokollverständnis auf Transport- und Vertragsebene (HTTP, OpenAPI, WSDL/SOAP), automatisierte Assertions, Request-Chaining und Mocking.
2. **Stufe 2 — Transport- & Nachrichtensicherheit (M05–M08, 6,5 h):** Secret-Hygiene, OpenAPI-`securitySchemes`, X.509/Custom-CA/mTLS sowie nachrichtenbasierte SOAP-Sicherheit (WS-Security).
3. **Stufe 3 — Moderne Identitäts- & Autorisierungsarchitekturen (M09–M12, 8,25 h):** OAuth 2.0 vs. RFC 9700 / OAuth 2.1, PKCE, Client Credentials, OIDC Discovery/JWKS, Token-Lebenszyklus, Security-Audits und CI/CD-Automatisierung.

## 2. Das Prinzip der Werkzeug-Triangulation

Statt Schnittstellen über eine einzige grafische Oberfläche zu erlernen, erleben Teilnehmende jedes Schlüsselkonzept (Vertrag, Payload, Authentifizierung, Fehleranalyse) aus drei Perspektiven:

| Werkzeug | Didaktische Rolle | Stärken im Kurs | Bewusste Abgrenzung |
| :--- | :--- | :--- | :--- |
| **`curl` + `jq`** | Unverfälschte Protokoll-Kontrollinstanz | Macht HTTP-Header, TLS-Handshakes (`-v`), Statuscodes und Token-Austausche ohne GUI-Abstraktion sichtbar | Erfordert strikte Secret-Disziplin (`-K -`, `--netrc-file`, kein Klartext-Passwort in Shell-Historie) |
| **Bruno (v3/v4)** | Git-nativer REST/OpenAPI-Client & CI-Runner | Reines OpenCollection-YAML-Format (`.yml`), PKCE über System-Browser, Collection-Vererbung, `bru run` in CI | Kein Ersatz für komplexe XML-/WSDL- und WS-Security-Prüfungen |
| **SoapUI OS 5.10.1** | Streng typisierter XML-/WSDL- & Enterprise-Client | WSDL-1.1-Import, WS-I Compliance Check, XPath/XQuery Assertions, Property Transfer, vollständige WS-Security | Keine codelosen Excel/CSV-DataSources (ReadyAPI), kein modernes PKCE im Open-Source-OAuth-Dialog |

### Verbindliche Architektur-Entscheidungen (Stand November 2026)

1. **Sortenreines OpenCollection YAML in Bruno:** Alle Collections werden ausschliesslich im OpenCollection-YAML-Format (`.yml`) erstellt. Gemischte `.bru`- und `.yml`-Dateien innerhalb derselben Collection werden strikt vermieden.
2. **Ehrliche Abgrenzung von SoapUI Open Source:** Kostenpflichtige ReadyAPI-Funktionen werden nicht als Open-Source-Features dargestellt. Stattdessen wird die Stärke von SoapUI OS bei WSDL/WS-Security gezielt mit Bruno und `curl` für OAuth 2.1 + PKCE kombiniert.
3. **OAuth 2.1 (Draft-17) & RFC 9700 (BCP 240):** Authorization Code wird konsequent mit PKCE (`S256`) gelehrt. Implicit Grant und ROPC werden ausschliesslich als warnende Legacy-Negativbeispiele im abgesicherten Labor behandelt.
4. **Reproduzierbares lokales Labor:** Alle Kernübungen laufen deterministisch gegen lokale Docker-Container (`lab/docker-compose.yml`), damit Firmen-Firewalls oder instabile öffentliche Sandboxes den Kursbetrieb nicht gefährden. Öffentliche Sandboxes dienen lediglich als dokumentierter Fallback.
