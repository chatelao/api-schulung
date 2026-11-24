---
module_id: M01
title: "HTTP-Fundament & erste API-Requests (Zero-Install in Swagger Web UI)"
level: "Stufe 1 - Grundlagen"
duration_minutes: 90
tools: ["Webbrowser (Swagger Web UI)", "Bruno Desktop (optional)"]
standards: ["RFC 9110 (HTTP Semantics)", "JSON"]
lab_services: ["public (petstore3.swagger.io, httpbin.org)", "optional A00: petstore3, go-httpbin"]
prerequisites: ["M00"]
---

# Übung M01: HTTP-Fundament direkt in öffentlichen Swagger Web UIs

## 1. Szenario und Zielzustand

Du öffnest zum ersten Mal zwei öffentliche Test-APIs direkt im Browser — ganz **ohne Docker** und **ohne Client-Installation**: den öffentlichen **Petstore** (`https://petstore3.swagger.io/`) und **HTTPBin** (`https://httpbin.org/`). Beide bieten direkt eine interaktive **Swagger Web UI**! Du erkundest URLs, HTTP-Header, Statuscodes (`200`, `404`, `405`, `415`) und einen vollständigen CRUD-Zyklus (*Anlegen → Lesen → Ändern → Löschen*).

*(Optional: Falls du offline arbeiten möchtest, starte vorher unser eigenes Container-Labor gemäss [Advanced A00](../advanced/A00-lokales-labor-docker.md) und nutze `http://localhost:8080` bzw. `http://localhost:8180`.)*

## 2. Aufgabenpakete

### Aufgabe A: Echo & Statuscodes in HTTPBin Swagger Web UI (`https://httpbin.org/`)
1. Öffne **https://httpbin.org/** im Webbrowser.
2. Klappe **`GET /headers`** auf → klicke **Try it out → Execute** und lies im **Response body** ab, welche Header dein Browser automatisch gesendet hat (`User-Agent`, `Accept` usw.).
3. Klappe **`GET /anything`** auf → **Try it out → Execute** und vergleiche die angezeigte **Request URL** und deine IP/Methode in der Antwort.
4. Klappe **`GET /status/{codes}`** auf → teste nacheinander `200`, `404` und `418` und beobachte die zurückgemeldeten Statuscodes.

### Aufgabe B: Gezielte HTTP-Fehler verstehen (`https://petstore3.swagger.io/`)
1. Öffne **https://petstore3.swagger.io/** im Browser.
2. Rufe **`GET /pet/{petId}`** mit der ID `99999999` auf → beobachte **`404 Not Found`**.
3. *(Falls Bruno Desktop bereits installiert ist — oder im [HTTP-Baukasten des Lernstudios](https://chatelao.github.io/api-schulung/#labs:http)):* Simuliere `POST https://petstore3.swagger.io/api/v3/pet` mit `Content-Type: text/plain` → **`415 Unsupported Media Type`**, sowie `DELETE https://petstore3.swagger.io/api/v3/pet` (ohne ID) → **`405 Method Not Allowed`**.

### Aufgabe C: Vollständiger CRUD-Durchlauf in Swagger Web UI (`https://petstore3.swagger.io/`)
*(Tipp: Nimm eine eigene 6-stellige ID wie z. B. `202611`, damit sich parallele Kursteilnehmende nicht überschreiben.)*
1. Lege über **`POST /pet`** ein neues Tier (`"id": 202611`, `"name": "Luna"`, `"status": "available"`) an.
2. Rufe es über **`GET /pet/{petId}`** (`202611`) ab und prüfe den Namen.
3. Ändere den Status über **`PUT /pet`** auf `"sold"` (`"id": 202611`).
4. Lösche es über **`DELETE /pet/{petId}`** (`202611`) und verifiziere beim erneuten `GET /pet/202611`, dass nun `404` erscheint.

### Bonus-Challenge D: HTTP-Baukasten im Interaktiven Lernstudio
Öffne das [Interaktive Lernstudio → Interaktive Labs → 1. HTTP & URL Baukasten](https://chatelao.github.io/api-schulung/#labs:http) und stelle die Kombinationen `GET /api/v3/pet`, `GET /api/v3/pet/99999999` und `POST` + `text/plain` nach.

> **Hinweis:** Die Shell-/Terminal-Variante mit `curl` und `jq` befindet sich im [Advanced-Track](../advanced/A01-http-curl-jq.md).

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Warum führt DELETE /pet ohne ID zu 405 statt 404?</summary>

Die URL `/api/v3/pet` existiert zwar auf dem Server, unterstützt aber nur `POST` und `PUT`, nicht `DELETE` (dafür braucht es `/api/v3/pet/{petId}`). Deshalb antwortet der Server mit **`405 Method Not Allowed`**.

</details>

<details>
<summary>Tipp 2 (Konkret): Beispiel-JSON für POST /pet und PUT /pet in Swagger UI</summary>

```json
{
  "id": 202611,
  "name": "Luna",
  "category": { "id": 1, "name": "Dogs" },
  "photoUrls": ["https://example.invalid/luna.png"],
  "status": "available"
}
```

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] Ich konnte `https://petstore3.swagger.io/` und `https://httpbin.org/` ohne lokale Server-Installation im Browser bedienen.
- [ ] Ich kann erklären, was Host, Pfad, Query-Parameter, Header und Body in einer HTTP-Anfrage bedeuten.
- [ ] `404`, `405` und `415` wurden gezielt ausgelöst/simuliert und verstanden.
- [ ] `POST` → `GET` → `PUT` → `DELETE` wurde in der Swagger Web UI vollständig durchgeführt.
