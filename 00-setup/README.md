# Modul 0: Zero-Install-Einstieg (Swagger Web UI) & Werkzeug-Überblick (`M00`)

- **Dauer:** 20 Minuten (sofort startklar ohne Container!)
- **Stufe:** Einstieg (ohne Shell-, Docker- oder Netzwerk-Vorkenntnisse)
- **Werkzeuge:** **Webbrowser** (für M01 sofort!), später **Bruno Desktop** (ab M02) & **SoapUI Open Source 5.10.1** (ab M03)

## 1. Lernziele

Nach Abschluss dieses Setup-Moduls kannst du:
1. **Ganz ohne Installation** direkt im Webbrowser über öffentliche **Swagger Web UIs** reale API-Requests senden und Antworten ablesen.
2. Einordnen, ab welchem Modul die grafischen Desktop-Tools **Bruno Desktop** (M02) und **SoapUI OS 5.10.1** (M03) hilfreich werden.
3. Wissen, wann und wo du bei Bedarf das optionale **eigene Docker-Container-Labor** im [Advanced-Track (`A00`)](../advanced/A00-lokales-labor-docker.md) startest.

## 2. Schritt 1: Sofort-Start im Webbrowser (0 Minuten Installation!)

Für **Modul 1 (HTTP-Fundament)**, Teile von **Modul 2, 5, 6, 7, 9, 11** sowie das **Interaktive Lernstudio** brauchst du **weder Docker noch ein Terminal noch einen installierten API-Client**:

Öffne einfach diese öffentlichen Test-Endpunkte in deinem Browser:

| Öffentlicher Dienst | Direkte URL | Was du dort ohne Installation siehst |
| :--- | :--- | :--- |
| **Petstore3 Swagger Web UI** | https://petstore3.swagger.io/ | Interaktive REST-API-Oberfläche (*Try it out*) inklusive OpenAPI-Spec (`/api/v3/openapi.json`) |
| **HTTPBin Swagger Web UI** | https://httpbin.org/ | Echo- und Auth-Endpunkte direkt als klickbare Swagger Web UI (`/headers`, `/status/...`, `/basic-auth/...`, `/bearer`) |
| **Interaktives Lernstudio** | https://chatelao.github.io/api-schulung/ | Lernplan-Tracker, Checkpoints (`CP-0..CP-3`), HTTP-/OpenAPI-/PKCE-/JWT-Labs & Flashcards |
| **OIDC Discovery (Duende Demo)** | https://demo.duendesoftware.com/.well-known/openid-configuration | Öffentliche OpenID-Connect-Visitenkarte und `jwks_uri` für Modul 11 |
| **TLS-Fehler-Beispiele** | https://badssl.com/ | Öffentliche Testseiten für abgelaufene, selbstsignierte oder falsche Zertifikate (Modul 7) |

> **Warum erst Swagger Web UI statt sofort Bruno?** In einer **Swagger Web UI** liegt die Bedienoberfläche direkt auf der Adresse des Servers — du musst nichts installieren, nichts konfigurieren und siehst Methode, URL, Parameter und JSON-Antwort sofort im selben Browser-Tab.

## 3. Schritt 2: Optionale Desktop-Tools (erst ab M02 / M03 nötig, immer noch ohne Docker)

- **Ab Modul 2 (OpenAPI & Collections):** Lade **[Bruno Desktop](https://www.usebruno.com/downloads)** herunter. Damit speicherst du API-Anfragen als eigene Sammlungen (*OpenCollection YAML*) und organisierst Umgebungen (`public` / `local`).
- **Ab Modul 3 (SOAP & WSDL):** Lade **[SoapUI Open Source 5.10.1](https://www.soapui.org/downloads/soapui/)** herunter. Damit kannst du auch öffentliche WSDL-Dienste wie `http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL` direkt testen.

## 4. Schritt 3 (Optional / Advanced): Eigenes Docker-Container-Labor (`A00`)

Ein eigenes lokales Server-Labor mit 6 Docker-Containern (`lab/docker-compose.yml`) brauchst du **erst dann**, wenn du:
- **offline** oder ohne öffentliche Rate-Limits arbeiten willst,
- fortgeschrittene Sicherheits-Labs mit **eigener Custom-CA & mTLS (`M07`)**, **WS-Security Java-Keystores (`M08`)**, einem **eigenen Keycloak-Server (`M10`–`M12`)** oder das **Capstone-Projekt** lokal durchspielst, oder
- den **Advanced-Track (`A01`–`A06` mit `curl` & CI)** bearbeitest.

Die vollständige 4-Zeilen-Anleitung für das eigene Container-Labor findest du unter **[Advanced A00: Eigenes Docker-Container-Labor aufsetzen](../advanced/A00-lokales-labor-docker.md)**.
