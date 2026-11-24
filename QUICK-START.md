# QUICK-START.md — Sofort-Start (0 Minuten Installation) bis Advanced-Labor

Wähle je nach Kenntnisstand und Modul deinen passenden Einstieg — von **sofort im Browser** bis zum **vollständigen Docker-Labor im Advanced-Teil**.

## Option 1: Sofort-Start im Webbrowser (0 Minuten Installation — empfohlen für den Einstieg!)

Für **M00, M01**, grosse Teile von **M02, M05, M06, M07, M09, M11** sowie das **Interaktive Lernstudio** musst du **nichts installieren** — ein Webbrowser reicht:

1. Öffne **Petstore3 Swagger Web UI**: https://petstore3.swagger.io/
2. Öffne **HTTPBin Swagger Web UI**: https://httpbin.org/
3. Öffne das **Interaktive Lernstudio**: https://chatelao.github.io/api-schulung/
4. Starte direkt mit [Modul 1: HTTP-Fundament über Swagger Web UI](01-module/M01-http-fundament-curl/README.md).

## Option 2: Desktop-Clients ohne Docker (ab M02 / M03)

Sobald du eigene API-Sammlungen speichern oder SOAP/WSDL-Verträge testen möchtest, installiere nur zwei Desktop-Programme (weiterhin ohne Terminal und ohne Docker):

- **Bruno Desktop (v3/v4)** — für REST/OpenAPI-Collections (`M02`, `M04`–`M06`, `M09`, `M11`; in `petstore-lab` und `auth-hygiene-lab` gibt es ein fertiges Environment **`public`**!).
- **SoapUI Open Source 5.10.1** — für WSDL/SOAP-Services (`M03`, z. B. gegen den öffentlichen CountryInfo-WSDL-Dienst).

## Option 3 (Advanced / Security-Vertiefung): Eigenes Docker-Container-Labor

Alle eigenen Server-Container (`petstore3`, `keycloak`, `mock-oauth2`, `go-httpbin`, `tls-proxy` für Custom-CA/mTLS und `soap-service` für XSD-Faults/WS-Security) sind in den **Advanced-Teil** ausgelagert:

- Anleitung: **[Advanced A00: Eigenes Docker-Container-Labor aufsetzen](advanced/A00-lokales-labor-docker.md)**
- Dort findest du auch die 4 Kopier-Befehle für `.env`, Zertifikatsgenerierung (`./lab/certs/generate-certs.sh`), `docker compose up -d` und `./00-setup/smoke-test.sh`.

## Nächster Schritt

Lies [00-setup/README.md](00-setup/README.md) oder springe direkt in [Modul 1](01-module/M01-http-fundament-curl/README.md).
