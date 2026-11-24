# A00: Eigenes Docker-Container-Labor aufsetzen (Offline, Security, mTLS, Keycloak & SOAP)

Für den **Basis-Einstieg (`M00`–`M02`, `M05`, `M06`, `M09`, `M11`)** genügen ein Webbrowser und öffentliche Swagger-Web-UIs (wie `https://petstore3.swagger.io/` und `https://httpbin.org/`) — ganz ohne Installation eigener Server.

Sobald du jedoch **unabhängig vom Internet**, **ohne öffentliche Rate-Limits** oder in **speziellen Sicherheits-Labs** arbeiten möchtest (eigene Custom-CA & mTLS, SOAP WS-Security mit Keystores, lokaler Keycloak-OAuth-2.1-IdP, sämtliche `curl`-Skripte `A01`–`A06` und das Capstone-Projekt), startest du hier unser reproduzierbares 6-Container-Labor ([lab/docker-compose.yml](../lab/docker-compose.yml)).

## 1. Enthaltenes Container-Setup (`lab/docker-compose.yml`)

| Container / Dienst | Adresse im Browser / Client | Aufgabe im Labor |
| :--- | :--- | :--- |
| **`petstore3`** | `http://localhost:8080` | Eigener Petstore-REST-Server mit **Swagger Web UI** & `/api/v3/openapi.json` |
| **`keycloak`** (v26.8.2) | `http://localhost:8081` | Produktivnaher OAuth-2.1-/OIDC-Identity-Provider (`api-lab` Realm) |
| **`mock-oauth2`** (v6.1.1) | `http://localhost:8090` | Leichtgewichtiger OAuth-2.1-/OIDC-Testserver für schnelle Token-Checks |
| **`go-httpbin`** | `http://localhost:8180` | Lokaler HTTP-Echo-, Redirect-, Basic-/Digest-/Bearer-Testserver |
| **`tls-proxy`** (`nginx`) | `https://localhost:8444` (Custom CA) / `https://localhost:8443` (mTLS) | TLS-Terminierung mit eigener CA sowie strikter Client-Zertifikatsprüfung |
| **`soap-service`** (Python) | `http://localhost:9000/soap?wsdl` | Eigener SOAP-1.1/1.2- & WS-Security-Auftragsdienst mit XSD-Validierung |

## 2. Voraussetzung & Einrichtung (Copy & Paste)

Benötigt werden **Docker Desktop** (Windows/macOS) bzw. **Docker Engine + Docker Compose** (Linux) sowie für die Shell-Übungen `curl`, `jq`, `openssl` und optional `@usebruno/cli` (`bru`).

Öffne ein Terminal im Hauptordner `api-schulung` und führe diese vier Zeilen nacheinander aus:

```bash
# 1. Konfigurationsvorlage kopieren (enthaelt nur Labor-Platzhalter, steht in .gitignore)
cp lab/.env.example lab/.env

# 2. Lokale Root-CA, Server-/Client-Zertifikate und Java-Keystores erzeugen (fuer M07, M08, A04, Capstone)
./lab/certs/generate-certs.sh

# 3. Alle sechs Labor-Container im Hintergrund starten
docker compose -f lab/docker-compose.yml --env-file lab/.env up -d

# 4. Pruefen, ob alle Container antworten (ca. 20-30s nach dem ersten Start)
./00-setup/smoke-test.sh
```

> **Linux-Hinweis für Browser-Logins (`M10` / Keycloak):** Damit Browser auf dem Host und Container im Docker-Netzwerk denselben Issuer-Hostnamen auflösen, füge einmalig `127.0.0.1 host.docker.internal` in `/etc/hosts` ein (unter macOS und Windows mit Docker Desktop automatisch vorhanden).

## 3. Browser- & CLI-Prüfung

Nach 20–30 Sekunden sollten folgende Adressen `200 OK` liefern:
- **Petstore Swagger UI (lokal):** `http://localhost:8080`
- **Echo-Testserver (lokal):** `http://localhost:8180`
- **SOAP-Vertrag (lokal):** `http://localhost:9000/soap?wsdl`
- **Keycloak OIDC Discovery:** `http://localhost:8081/realms/api-lab/.well-known/openid-configuration`
- **Custom-CA HTTPS (`8444`) & mTLS (`8443`):** Prüfbar in Bruno Desktop (mit `ca.crt` + `client.crt`/`client.key`) bzw. via `./scripts/curl/m07-mtls-test.sh`.

## 4. Labor sauber stoppen

```bash
docker compose -f lab/docker-compose.yml down
```

## 5. Troubleshooting

| Symptom | Ursache | Lösung |
| :--- | :--- | :--- |
| `docker` Befehl nicht gefunden | Docker Desktop ist nicht installiert oder nicht gestartet | Docker Desktop starten und Terminal neu öffnen |
| Port bereits belegt | Ein anderes Programm nutzt bereits `8080`, `8081` oder `9000` | Anderes Programm schliessen oder Docker neu starten |
| Keycloak braucht > 30s beim ersten Start | Initialer Aufbau der Testdatenbank (`api-lab`) | Kurz 30 Sekunden warten und `./00-setup/smoke-test.sh` erneut ausführen |
| `lab/certs/out/` fehlt | Schritt 2 wurde übersprungen | `./lab/certs/generate-certs.sh` ausführen |

## 6. Querverweise

- **Smoke-Test-Skript:** [00-setup/smoke-test.sh](../00-setup/smoke-test.sh)
- **Weiter mit den CLI-Modulen:** [A01: HTTP-Fundament & curl](A01-http-curl-jq.md)
- **Zurück zum Zero-Install-Einstieg:** [M00: Zero-Install-Start (Swagger Web UI)](../00-setup/README.md)
