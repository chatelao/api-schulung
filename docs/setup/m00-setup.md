# Modul 0: Labor-Setup, Terminal-Crashkurs & Smoke-Tests (`M00`)

- **Dauer:** 45 Minuten
- **Stufe:** Einstieg (ohne Shell-Vorkenntnisse)
- **Werkzeuge:** Docker Desktop (oder Docker Engine), **Bruno Desktop**, **SoapUI Open Source 5.10.1**, Webbrowser

## 1. Lernziele

Nach Abschluss dieses Setup-Moduls kannst du:
1. Mit drei einfachen Copy-Paste-Befehlen im Terminal das lokale Übungslabor starten (auch ohne frühere Shell-Erfahrung).
2. Die sechs lokalen API-Dienste im Webbrowser aufrufen und dich vergewissern, dass alles läuft.
3. **Bruno Desktop** und **SoapUI Open Source 5.10.1** öffnen und für den Kurs vorbereiten.

## 2. Kurzer Terminal-Crashkurs (falls du selten eine Shell nutzt)

Ein **Terminal** (unter Windows *PowerShell* oder *Git Bash*, unter macOS *Terminal*) ist nur ein Textfenster, in das man Befehle einfügt und mit **Enter** bestätigt.
- Für den Basis-Lehrgang brauchst du das Terminal **nur hier in Modul 0 einmal zum Starten** der Übungsumgebung. Danach arbeiten wir mit grafischen Programmen (**Bruno Desktop**, **SoapUI**, **Browser**).
- Falls du später tiefer in die Kommandozeile einsteigen möchtest, wartet der optionale [Advanced-Track (`curl` & Shell)](../advanced/index.md) auf dich.

## 3. Schritt-für-Schritt-Einrichtung (Copy & Paste)

Öffne ein Terminal im Ordner `api-schulung` und führe diese vier Zeilen nacheinander aus:

```bash
# 1. Konfigurationsvorlage kopieren
cp lab/.env.example lab/.env

# 2. Lokale Test-Zertifikate erzeugen (fuer Modul 7 & 8)
./lab/certs/generate-certs.sh

# 3. Alle Labor-Server im Hintergrund starten
docker compose -f lab/docker-compose.yml --env-file lab/.env up -d

# 4. Pruefen, ob alle Dienste antworten (ca. 20-30s nach Start)
./00-setup/smoke-test.sh
```

### Prüfen im Browser (ohne Terminal)
Alternativ kannst du nach 30 Sekunden einfach diese Links im Browser öffnen:
- **Petstore Swagger UI:** `http://localhost:8080`
- **Echo-Testserver:** `http://localhost:8180`
- **SOAP-Vertrag (WSDL):** `http://localhost:9000/soap?wsdl`
- **Keycloak OIDC-Visitenkarte:** `http://localhost:8081/realms/api-lab/.well-known/openid-configuration`

### Linux-Hinweis für Browser-Logins in Modul 10 (`host.docker.internal`)
Falls du Linux nutzt und später in Browser-Logins `host.docker.internal` verwendet wird, füge einmalig `127.0.0.1 host.docker.internal` in `/etc/hosts` ein (unter macOS und Windows mit Docker Desktop automatisch vorhanden).

## 4. Troubleshooting

| Symptom | Ursache | Lösung |
| :--- | :--- | :--- |
| `docker` Befehl nicht gefunden | Docker Desktop ist nicht installiert oder nicht gestartet | Docker Desktop starten und Terminal neu öffnen |
| Port bereits belegt | Ein anderes Programm nutzt bereits `8080`, `8081` oder `9000` | Anderes Programm schliessen oder Docker neu starten |
| Keycloak braucht > 30s beim ersten Start | Initialer Aufbau der Testdatenbank (`api-lab`) | Kurz 30 Sekunden warten und `./00-setup/smoke-test.sh` erneut ausführen |
