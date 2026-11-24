# QUICK-START.md — 15-Minuten-Installation & Smoke-Test

Diese Anleitung bringt deine lokale Laborumgebung in unter 15 Minuten zum Laufen.

## 1. Voraussetzungen prüfen

Für den **Basis-Lehrgang (M00–M12)** genügen **Docker**, ein moderner **Browser**, **Bruno Desktop** und **SoapUI Open Source 5.10.1**. Du musst im Basis-Lehrgang keine eigenen `curl`- oder Shell-Kommandos schreiben — für den Start des Labors reichen vier kopierfertige Zeilen (siehe [00-setup/README.md](setup/m00-setup.md) mit Terminal-Crashkurs).

Prüfe im Terminal die Docker-Installation:

```bash
docker --version
docker compose version
```

*Optional für den [Advanced-Track (Shell & curl)](advanced/index.md) und CI-Automatisierung:*

```bash
curl --version
jq --version
openssl version
bru --version       # @usebruno/cli (optional fuer GUI-only, verwendet in A06 & CI)
```

> **Hinweis zu Bruno:** Installiere für den Basis-Kurs **Bruno Desktop** (v3/v4). Die CLI (`npm install -g @usebruno/cli`) wird erst im Advanced-Kapitel `A06` und in der CI benötigt.
> **Hinweis zu SoapUI:** Lade **SoapUI Open Source 5.10.1** herunter und prüfe, ob sich die Anwendung starten lässt.

## 2. Repository vorbereiten & `.env` anlegen

```bash
cp lab/.env.example lab/.env
```

Passe `lab/.env` bei Bedarf an (Standardwerte sind für den lokalen Laborbetrieb vorkonfiguriert und enthalten ausschliesslich Labor-Platzhalter).

## 3. Zertifikate erzeugen & Labor-Container starten

```bash
# 1. Lokale Root-CA, Server-, Client-Zertifikate und Java-Keystores erzeugen (fuer M07/M08/Capstone)
./lab/certs/generate-certs.sh

# 2. Docker-Compose-Stack im Hintergrund starten
docker compose -f lab/docker-compose.yml --env-file lab/.env up -d
```

> **Linux-Hinweis für OAuth/OIDC (M09–M12):** Damit Browser auf dem Host und Container im Docker-Netzwerk denselben Issuer-Hostnamen auflösen, füge einmalig `127.0.0.1 host.docker.internal` in `/etc/hosts` ein (unter macOS/Windows mit Docker Desktop bereits automatisch vorhanden).

## 4. Smoke-Test ausführen

Warte ca. 20–30 Sekunden (bis Keycloak gestartet ist) und starte dann das Verifikationsskript:

```bash
./00-setup/smoke-test.sh
```

Erwartete Ausgabe:
- Petstore3 (`http://localhost:8080/api/v3/openapi.json`): `200 OK`
- go-httpbin HTTP (`http://localhost:8180/status/200`): `200 OK`
- tls-proxy Custom-CA HTTPS (`https://localhost:8444/status/200` mit Custom CA): `200 OK`
- tls-proxy mTLS (`https://localhost:8443/headers` mit Custom CA + Client-Cert): `200 OK`
- SOAP-Service (`http://localhost:9000/soap?wsdl`): `200 OK`
- mock-oauth2-server (`http://localhost:8090/isalive`): `200 OK`
- Keycloak (`http://localhost:8081/realms/api-lab/.well-known/openid-configuration`): `200 OK`

## 5. Nächster Schritt

Lies [00-setup/README.md](setup/m00-setup.md) für Troubleshooting-Details und starte anschliessend mit [Modul 1: HTTP-Fundament & erste API-Requests](module/M01.md).
