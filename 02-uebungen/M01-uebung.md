---
module_id: M01
title: "HTTP-Fundament & erste API-Requests ohne Shell-Vorkenntnisse"
level: "Stufe 1 - Grundlagen"
duration_minutes: 90
tools: ["Webbrowser (Swagger UI)", "Bruno Desktop (GUI)"]
standards: ["RFC 9110 (HTTP Semantics)", "JSON"]
lab_services: ["petstore3", "go-httpbin"]
prerequisites: ["M00"]
---

# Übung M01: HTTP-Fundament & erste API-Requests (Swagger UI & Bruno)

## 1. Szenario und Zielzustand

Du öffnest zum ersten Mal zwei API-Dienste im Labor: das Tierheim-System **Petstore** (`http://localhost:8080`) und einen **Echo-Testserver** (`http://localhost:8180`). Ganz ohne Kommandozeile erkundest du den Aufbau von URLs, Headern und Statuscodes und führst einen vollständigen Lebenszyklus (*Anlegen → Lesen → Ändern → Löschen*) in **Bruno Desktop** und **Swagger UI** durch.

## 2. Aufgabenpakete

### Aufgabe A: Echo & Header im Browser und in Bruno erkunden
1. Öffne `http://localhost:8180/anything/kurs` in **Bruno Desktop** (`GET`), füge im Tab **Headers** die Zeile `X-Kurs-Teilnehmer: dein-name` hinzu und klicke **Send**. Prüfe in der JSON-Antwort, wo dein Header wieder erscheint.
2. Teste `GET http://localhost:8180/redirect/2` in Bruno und schaue dir in der Response-Ansicht den finalen Statuscode (`200 OK`) an.

### Aufgabe B: Gezielte HTTP-Fehler verstehen (`petstore3`)
1. Provoziere in Bruno gegen `POST http://localhost:8080/api/v3/pet` einen **`415 Unsupported Media Type`**, indem du im Tab **Body** *Text* statt *JSON* wählst.
2. Provoziere mit `GET http://localhost:8080/api/v3/pet/99999999` einen **`404 Not Found`**.
3. Provoziere mit `DELETE http://localhost:8080/api/v3/pet` (ohne ID am Ende!) einen **`405 Method Not Allowed`**.

### Aufgabe C: Vollständiger CRUD-Durchlauf in Swagger UI (`http://localhost:8080`)
1. Lege über **`POST /pet`** ein neues Tier (`"id": 2026`, `"name": "Luna"`, `"status": "available"`) an.
2. Rufe es über **`GET /pet/2026`** ab und prüfe den Namen.
3. Ändere den Status über **`PUT /pet`** auf `"sold"`.
4. Lösche es über **`DELETE /pet/2026`** und verifiziere beim erneuten `GET /pet/2026`, dass nun `404` erscheint.

### Bonus-Challenge D: Antwortzeiten ablesen
Beobachte in Bruno Desktop neben dem Statuscode (`200 OK`) die angezeigte Antwortzeit in Millisekunden (`ms`) und die Grösse der Antwort (`B` / `KB`). Vergleiche `GET /pet/findByStatus?status=available` mit `GET /pet/2026`.

> **Hinweis:** Die Shell-/Terminal-Variante mit `curl` und `jq` befindet sich im [Advanced-Track](../advanced/A01-http-curl-jq.md).

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Warum führt ein fehlender Pfadteil zu 405 statt 404?</summary>

Die URL `/api/v3/pet` existiert zwar auf dem Server, unterstützt aber nur `POST` und `PUT`, nicht `DELETE` (dafür braucht es `/api/v3/pet/{petId}`). Deshalb antwortet der Server mit **`405 Method Not Allowed`**.

</details>

<details>
<summary>Tipp 2 (Konkret): Beispiel-JSON für POST /pet und PUT /pet</summary>

```json
{
  "id": 2026,
  "name": "Luna",
  "category": { "id": 1, "name": "Dogs" },
  "photoUrls": ["https://example.invalid/luna.png"],
  "status": "available"
}
```

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] Ich kann erklären, was Host, Port, Pfad, Header und Body in einer HTTP-Anfrage bedeuten.
- [ ] `415`, `404` und `405` wurden gezielt ausgelöst und verstanden.
- [ ] `POST` → `GET` → `PUT` → `DELETE` wurde in Swagger UI / Bruno vollständig durchgeführt.
- [ ] Nach dem `DELETE` liefert ein erneuter Abruf von ID `2026` den Status `404`.
