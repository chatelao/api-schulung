# Modul 0: Labor-Setup, Werkzeug-Check & Smoke-Tests (`M00`)

- **Dauer:** 45 Minuten
- **Stufe:** Einstieg
- **Werkzeuge:** Docker, Docker Compose, `curl`, `jq`, Bruno Desktop / `@usebruno/cli` (`bru`), SoapUI Open Source 5.10.1, `openssl`, `keytool`

## 1. Lernziele

Nach Abschluss dieses Setup-Moduls kannst du:
1. Den vollständigen lokalen Docker-Labor-Stack deterministisch starten und stoppen.
2. Lokale Zertifikate (Root-CA, Server-SAN, Client-PEM/PFX und Java-Keystores) reproduzierbar erzeugen.
3. Die Erreichbarkeit aller sechs Labor-Services mittels `00-setup/smoke-test.sh` automatisiert verifizieren.
4. Typische Installations- und Netzwerkprobleme (Ports, `/etc/hosts`, Docker-Hostnamen, Secret-Hygiene) eigenständig diagnostizieren.

## 2. Lokale Labor-Services & Ports

| Service | Host-URL | Zweck im Kurs |
| :--- | :--- | :--- |
| `petstore3` | `http://localhost:8080` | REST / OpenAPI 3.0 Sandbox (`/api/v3/openapi.json`) |
| `keycloak` | `http://localhost:8081` | Primärer IdP (Keycloak 26.8.2, Realm `api-lab`) |
| `mock-oauth2` | `http://localhost:8090` | Leichtgewichtiger OAuth2/OIDC-IdP (CI / Low-RAM) |
| `go-httpbin` | `http://localhost:8180` | HTTP-Echo, Basic/Digest/Bearer-Tests |
| `tls-proxy` (TLS) | `https://localhost:8444` | Server-TLS mit lokaler Custom CA (`nginx` vor `go-httpbin`) |
| `tls-proxy` (mTLS) | `https://localhost:8443` | Striktes Mutual TLS (Client-Zertifikat zwingend) |
| `soap-service` | `http://localhost:9000` | WSDL 1.1 (`/soap?wsdl`), SOAP 1.1/1.2 (`/soap`), WS-Security (`/soap/secure`) |

## 3. Schritt-für-Schritt-Einrichtung

```bash
# 1. Lokale .env-Datei aus Vorlage erstellen (wird von .gitignore ausgeschlossen)
cp lab/.env.example lab/.env

# 2. Zertifikate & Java-Keystores erzeugen
./lab/certs/generate-certs.sh

# 3. Labor-Container im Hintergrund starten
docker compose -f lab/docker-compose.yml --env-file lab/.env up -d

# 4. Smoke-Test ausfuehren (wartet bei Bedarf kurz auf Keycloak)
./00-setup/smoke-test.sh
```

### Linux-Besonderheit für Browser-OAuth-Flows (`host.docker.internal`)

Damit Webbrowser auf dem Host und Container im Docker-Netzwerk denselben OIDC-`issuer`-Hostnamen auflösen, füge unter Linux einmalig folgenden Eintrag in `/etc/hosts` hinzu:

```text
127.0.0.1 host.docker.internal
```

*(Unter macOS und Windows mit Docker Desktop ist `host.docker.internal` bereits vorkonfiguriert.)*

## 4. Troubleshooting

| Symptom | Ursache | Lösung |
| :--- | :--- | :--- |
| Port bereits belegt (`address already in use`) | Lokaler Dienst nutzt `8080`, `8081`, `8443`, `8444` oder `9000` | Belegenden Prozess stoppen (`ss -tulpn` / `lsof -i :8080`) |
| `smoke-test.sh` meldet Fehler auf `8443`/`8444` | `./lab/certs/generate-certs.sh` wurde vor `docker compose up` nicht ausgeführt | Zertifikate erzeugen und `docker compose -f lab/docker-compose.yml restart tls-proxy` ausführen |
| `bru: command not found` | `@usebruno/cli` nicht global installiert | `npm install -g @usebruno/cli` (Node.js >= 20) |
| Keycloak braucht > 20s beim ersten Start | Initialer Realm-Import (`api-lab`) | `docker logs -f api-lab-keycloak` prüfen und `smoke-test.sh` erneut starten |
