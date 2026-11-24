---
module_id: M01
title: "HTTP-Fundament & curl ohne Magie"
level: "Stufe 1 - Grundlagen"
duration_minutes: 90
tools: ["curl", "jq"]
standards: ["RFC 9110 (HTTP Semantics)", "RFC 9112 (HTTP/1.1)"]
lab_services: ["go-httpbin", "petstore3"]
prerequisites: ["M00"]
---

# Übung M01: HTTP-Fundament & `curl` ohne Magie

## 1. Szenario und Zielzustand

Du sollst ein bestehendes REST-Backend (`petstore3` auf `http://localhost:8080`) sowie den HTTP-Echo-Service (`go-httpbin` auf `http://localhost:8180`) ohne grafische Hilfsmittel über die Kommandozeile analysieren. Am Ende besitzt du ein reproduzierbares Bash-Skript, das einen vollständigen CRUD-Lebenszyklus (`POST` → `GET` → `PUT` → `DELETE`) inklusive Fehlerbehandlung ausführt.

## 2. Aufgabenpakete

### Aufgabe A: Echo & Redirect-Analyse (`go-httpbin`)
1. Sende einen `GET`-Request an `http://localhost:8180/anything/kurs` mit einem eigenen Header `X-Kurs-Teilnehmer: dein-name` und prüfe per `jq`, wie der Server diesen Header zurückspiegelt.
2. Rufe `http://localhost:8180/redirect/3` einmal ohne und einmal mit `-L` auf und notiere alle durchlaufenen Statuscodes.

### Aufgabe B: Gezielte HTTP-Fehler provozieren (`petstore3`)
1. Provoziere am Petstore-Endpunkt `http://localhost:8080/api/v3/pet` einen Status **`415 Unsupported Media Type`**.
2. Provoziere einen **`404 Not Found`** für eine nicht existierende Pet-ID (z. B. `99999999`).
3. Provoziere einen **`405 Method Not Allowed`**.

### Aufgabe C: Vollständiges CRUD-Bash-Skript
Erstelle ein ausführbares Bash-Skript (oder teste dein eigenes Skript), das:
1. Per `curl --json` ein neues Pet (`id: 2026`, `name: "Luna"`, `status: "available"`) anlegt.
2. Die zurückgegebene `id` mit `jq -r` in eine Variable speichert.
3. Das Pet mit `GET` abruft und den Namen prüft.
4. Den Status per `PUT` auf `"sold"` aktualisiert.
5. Das Pet mit `DELETE` löscht und anschliessend per `GET` verifiziert, dass HTTP `404` zurückkommt.

### Bonus-Challenge D: Performance-Timing messen
Nutze `curl -w` (`--write-out`), um DNS-Auflösung (`time_namelookup`), Verbindungsaufbau (`time_connect`), Time-To-First-Byte (`time_starttransfer`) und Gesamtzeit (`time_total`) für einen Petstore-Abruf in JSON auszugeben.

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Wie fängt man HTTP-Fehler und JSON-Antworten sauber in Bash ab?</summary>

Nutze `curl -sS -o /dev/null -w "%{http_code}"`, wenn du nur den Statuscode prüfen willst (z. B. beim `404`-Check nach dem Löschen). Für normale API-Aufrufe hilft `--fail-with-body`, damit Fehler sofort sichtbar werden.

</details>

<details>
<summary>Tipp 2 (Konkret): Beispiel-Kommandos für Aufgabe B und Bonus D</summary>

```bash
# 415 provozieren:
curl -i -X POST http://localhost:8080/api/v3/pet -H "Content-Type: text/plain" -d "ungueltig"

# Timing-Ausgabe fuer Bonus D:
curl -sS -o /dev/null -w '{"dns":%{time_namelookup},"connect":%{time_connect},"ttfb":%{time_starttransfer},"total":%{time_total}}\n' \
  http://localhost:8080/api/v3/pet/findByStatus?status=available
```

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] `415`, `404` und `405` wurden reproduzierbar am lokalen Petstore ausgelöst und verstanden.
- [ ] `POST` → `GET` → `PUT` → `DELETE` läuft automatisiert ohne manuelles Kopieren der ID.
- [ ] Nach dem `DELETE` liefert ein erneutes `GET` auf dieselbe ID den Status `404`.
- [ ] Das Skript besteht `bash -n <skript.sh>` ohne Syntaxfehler.
