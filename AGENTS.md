# AGENTS.md — Verbindliche Arbeits- und Qualitätsregeln für KI-Assistenten

Dieses Dokument definiert die verbindlichen Leitplanken für KI-Agenten (Codex, Claude, Gemini u. a.) bei Pflege, Erweiterung und Prüfung des Schulungs-Repositories `api-schulung`.

## 1. Verbindliche Leitplanken und Anti-Halluzinations-Regeln

1. **Keine echten oder hartkodierten Geheimnisse:**
   - Alle Passwörter, Client-Secrets und API-Keys werden ausschliesslich als offensichtliche Labor-Platzhalter (z. B. `CHANGE_ME_LAB_ONLY`) in `.env.example`-Dateien dokumentiert.
   - `.env`, `*.key`, `*.p12`, `*.pfx`, `*.jks`, `*.pem`, `*.crt` und `client-cert-config.json` stehen zwingend in `.gitignore`.

2. **Reines OpenCollection YAML in Bruno:**
   - Alle Bruno-Collections unter `collections/bruno/` verwenden konsequent das **OpenCollection-YAML-Format (`.yml`)** (Bruno v3/v4) mit `opencollection.yml` (`opencollection: 1.0.0`) im Collection-Root.
   - Innerhalb derselben Collection werden **niemals** `.bru`- und `.yml`-Dateien gemischt (kein `bruno.json`).

3. **SoapUI Open Source ehrlich abgrenzen:**
   - Dieses Curriculum nutzt **SoapUI Open Source (Version 5.10.1)**.
   - Kostenpflichtige ReadyAPI-Funktionen (z. B. DataSource-Excel-Loops, automatisierte Browser-OAuth-Skripte, Form-View oder automatisches WSDL-Refactoring) dürfen **niemals** als Open-Source-Features ausgegeben werden.

4. **OAuth-2.1-/RFC-9700-Konformität:**
   - Authorization Code wird stets mit **PKCE (`S256`)** eingesetzt — niemals `plain`.
   - Implicit Grant (`response_type=token`) und Resource Owner Password Credentials (ROPC, `grant_type=password`) werden ausschliesslich als ausdrücklich warnend gekennzeichnete Legacy-Negativbeispiele oder Migrations-Audits aufgeführt.
   - Niemals `?access_token=` in URL-Query-Strings empfehlen.

5. **Strikte Trennung von ID Token und Access Token:**
   - Kein Codebeispiel darf ein OIDC-ID-Token als `Authorization: Bearer` an eine Fach-API senden.
   - Kein Access Token darf als Benutzer-Authentifizierungsnachweis im Client zweckentfremdet werden.
   - Base64URL-Dekodierung (`jq`) dient ausschliesslich der Inspektion; kryptografische Verifikation erfordert Signaturprüfung gegen `jwks_uri`.

6. **Sichere `curl`-Kommandos:**
   - Jedes `curl`-Beispiel mit Zugangsdaten nutzt `--config` / `-K` (bevorzugt `-K -` über `stdin`), `--netrc-file` oder Umgebungsvariablen statt Klartext-Passwörtern in der Kommandozeile.
   - Alle XML-/SOAP-Uploads nutzen `--data-binary @datei.xml` zur Wahrung der Byte- und Zeilenumbruch-Integrität.
   - TLS-Vertrauensfehler werden über `--cacert` (Custom CA) statt `-k` / `--insecure` gelöst.

7. **Reale, konsistente Ports und Hostnamen:**
   - Alle Beispiele in Texten, Collections und Skripten müssen exakt zu den Ports in `lab/docker-compose.yml` passen:
     - Petstore3 (REST / OpenAPI 3.0): `http://localhost:8080`
     - Keycloak 26.8.2 (IdP primär): `http://localhost:8081` (bzw. `http://host.docker.internal:8081` für konsistente Issuer-URLs zwischen Browser und Container)
     - mock-oauth2-server 6.1.1 (IdP leichtgewichtig / CI): `http://localhost:8090`
     - go-httpbin (HTTP): `http://localhost:8180`
     - tls-proxy (`nginx` vor `go-httpbin`): `https://localhost:8444` (Custom-CA Server-TLS) / `https://localhost:8443` (striktes mTLS)
     - SOAP/WSDL + WS-Security-Service (Python): `http://localhost:9000`
   - Keine widersprüchlichen Beispiel-URLs oder erfundenen Ports.

8. **Sprachliche Konsistenz:**
   - Alle Erklärungen, Aufgabenstellungen und Kommentare werden in klarem, professionellem Deutsch verfasst.
   - Etablierte englische Fachbegriffe und Protokollschlüsselwörter (`Endpoint`, `Header`, `Bearer Token`, `Authorization Code Flow`, `WSDL`, `XPath`, `Assertion`, `Keystore`) bleiben unverfälscht im Original.

## 2. Verbindliches Datei- und Metadaten-Schema (Content Contract)

Jede Modulseite (`01-module/Mxx-slug/README.md`) und jede Übungsdatei (`02-uebungen/Mxx-uebung.md`) beginnt mit einem YAML-Frontmatter-Block (`module_id`, `title`, `level`, `duration_minutes`, `tools`, `standards`, `lab_services`, `prerequisites`).

Pflichtabschnitte pro Modul (`01-module/Mxx-slug/README.md`):
1. Lernziele (3–5 messbare Kompetenzen nach Bloom)
2. Architektur und Kernkonzepte (inkl. mindestens einer Vergleichstabelle)
3. Geführter Walkthrough (getrennt nach `curl`, `Bruno` und — wo anwendbar — `SoapUI`)
4. Typische Fallstricke und Troubleshooting (mindestens 3 Fehlerbilder mit Diagnose und Lösung)
5. Spickzettel (Cheat Sheet)
6. Querverweise (`../../02-uebungen/Mxx-uebung.md` und `../../03-loesungen/Mxx-loesung.md`)

Pflichtabschnitte pro Übung (`02-uebungen/Mxx-uebung.md`):
1. Szenario und Zielzustand
2. Aufgabenpakete (Pflichtaufgaben A–C sowie optionale Bonus-Challenge D)
3. Gestufte Hilfestellungen (`<details>`-Blöcke: Tipp 1 konzeptionell, Tipp 2 konkret)
4. Selbstkontrolle (Definition of Done als Checkbox-Liste)

## 3. Verifikation vor Commits

Vor jeder Änderung an Collections, Skripten oder Labor-Dateien prüfen:
- `bash -n` für alle Shell-Skripte unter `00-setup/`, `lab/certs/` und `scripts/curl/`
- `git status` und Suche nach Klartext-Secrets (keine `.env`, keine privaten Schlüssel)
- Konsistenz der OpenCollection-YAML-Dateien (keine `.bru`-Dateien in `collections/bruno/`)
