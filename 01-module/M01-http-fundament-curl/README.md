---
module_id: M01
title: "HTTP-Fundament & erste API-Requests (Zero-Install in Swagger Web UI)"
level: "Stufe 1 - Grundlagen"
duration_minutes: 90
tools: ["Webbrowser (Swagger Web UI)", "Bruno Desktop (optional)"]
standards: ["RFC 9110 (HTTP Semantics)", "HTTP/1.1 & HTTP/2", "JSON"]
lab_services: ["public (petstore3.swagger.io, httpbin.org)", "optional A00: petstore3, go-httpbin"]
prerequisites: ["M00"]
---

# Modul 1: HTTP-Fundament & erste API-Requests (direkt in Swagger Web UI)

## 1. Lernziele

Nach Abschluss dieses Moduls kannst du:
1. Den Aufbau einer **URL** (`Protokoll://Server/Pfad?Abfrage`) und den Austausch zwischen **Client** und **Server** anschaulich **erklären**.
2. Eine HTTP-Nachricht (**Methode**, **Header**, **Body**, **Statuscode**) direkt in einer **Swagger Web UI** im Browser sicher **lesen**.
3. Idempotente Operationen (`GET`, `PUT`, `DELETE`) von nicht-idempotenten Operationen (`POST`, `PATCH`) **unterscheiden**.
4. Erste CRUD-Requests (*Create, Read, Update, Delete*) sowie typische Fehlercodes (`404`, `405`, `415`) **ohne jede Installation** direkt über öffentliche Swagger-Web-UIs **ausführen**.

## 2. Architektur und Kernkonzepte (ohne Netzwerk-Vorwissen)

Stell dir eine **API** (*Application Programming Interface*) wie ein Restaurant vor:
- **Du (dein Webbrowser oder später Bruno)** bist der **Client** (Gast).
- **Der API-Dienst (z. B. `petstore3.swagger.io` oder `httpbin.org`)** ist der **Server** (die Küche).
- **HTTP** ist die gemeinsame Bestellsprache zwischen euch beiden — jeder Austausch besteht aus einer **Anfrage (Request)** und einer **Antwort (Response)**.

### Anatomie einer Web-Adresse (URL)

```text
https://petstore3.swagger.io/api/v3/pet/findByStatus?status=available
\___/   \__________________/\______________________/ \______________/
  |              |                     |                     |
Protokoll      Host             Pfad (Ressource)      Query-Parameter
```

- **Protokoll (`https://`):** Verschlüsselte Verbindung im Web (im lokalen Container-Labor aus `A00` auch unverschlüsselt als `http://localhost:8080`).
- **Host (`petstore3.swagger.io`):** Name des Computers im Internet, auf dem der Dienst läuft.
- **Header (Briefumschlag):** Metadaten wie `Content-Type: application/json` (*«Mein Paket enthält JSON-Text»*) oder `Accept: application/json` (*«Bitte antworte mir ebenfalls in JSON»*).
- **Body (Paketinhalt):** Die eigentlichen Nutzdaten (z. B. ein neues Haustier im JSON-Format).

### Vergleichstabelle: HTTP-Methoden & Statuscodes

| HTTP-Methode | Bedeutung im Alltag | Body nötig? | Idempotent (mehrfach gleich)? | Typischer Erfolgs-Code |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | Daten abrufen (*Lesen*) | Nein | Ja | `200 OK` |
| `POST` | Neuen Datensatz anlegen | Ja | **Nein** (legt ggf. neu an) | `200 OK` / `201 Created` |
| `PUT` | Datensatz vollständig ersetzen | Ja | Ja | `200 OK` / `204 No Content` |
| `DELETE` | Datensatz löschen | Nein | Ja | `200 OK` / `204 No Content` |

**Statuscode-Ampel:**
- **`2xx` (Grün — Erfolg):** `200 OK`, `201 Created`
- **`3xx` (Blau — Umleitung):** `302 Found` (leitet automatisch an eine neue Adresse weiter)
- **`4xx` (Gelb — Fehler auf Client-Seite):** `400 Bad Request` (ungültige Daten), `401`/`403` (fehlende Anmeldung/Berechtigung), `404 Not Found` (ID existiert nicht), `405 Method Not Allowed`, `415 Unsupported Media Type` (`Content-Type` passt nicht)
- **`5xx` (Rot — Fehler auf Server-Seite):** `500 Internal Server Error`

## 3. Geführter Walkthrough (Zero-Install: direkt in Swagger Web UI!)

Der niedrigschwelligste Einstieg braucht **keinen eigenen Server und keinen installierten API-Client** — die Testoberfläche ist direkt in die öffentlichen Webseiten eingebaut:

### Schritt 1: Petstore3 Swagger Web UI im Browser (`https://petstore3.swagger.io/`)

1. Öffne im Webbrowser **https://petstore3.swagger.io/**.
2. Klappe unter **pet** den grünen Balken **`GET /pet/findByStatus`** auf, klicke rechts auf **Try it out**, wähle `status = available` und klicke **Execute**.
3. Sieh dir unter **Responses → Server response** drei Dinge an:
   - **Request URL** (welche Adresse genau aufgerufen wurde),
   - **Code** (`200`),
   - **Response body** (die JSON-Liste der Tiere) und **Response headers**.
4. Klappe **`POST /pet`** auf → **Try it out** → wähle eine eigene ID (z. B. `"id": 202611`) und `"name": "Bello"` → **Execute** (`200`).
5. Rufe dein Tier über **`GET /pet/{petId}`** ab und lösche es danach mit **`DELETE /pet/{petId}`**.

### Schritt 2: Echo & Statuscodes in HTTPBin Swagger Web UI (`https://httpbin.org/`)

1. Öffne im zweiten Browser-Tab **https://httpbin.org/** — auch dieser Testserver bietet direkt eine interaktive **Swagger Web UI**!
2. Klappe unter **Request inspection** den Punkt **`GET /headers`** auf → **Try it out → Execute**: Im JSON-Body siehst du exakt, welche HTTP-Header dein Browser im Hintergrund mitgeschickt hat.
3. Klappe unter **Status codes** den Punkt **`GET /status/{codes}`** auf → gib `404` (und danach `415`) ein → **Execute**: Beobachte, wie die Antwort unmittelbar den entsprechenden HTTP-Statuscode liefert.

### Schritt 3 (Optional): Eigene Header & Fehler in Bruno Desktop sichtbar machen

Falls du später eigene Requests ausserhalb einer Swagger UI testen möchtest (z. B. bewusst `text/plain` statt JSON senden für `415`), öffne **Bruno Desktop** und lege einen Request gegen `https://httpbin.org/anything/kurs` an.

> **Für Fortgeschrittene (Eigenes Docker-Labor & `curl`):** Wer komplett offline in eigenen Containern (`http://localhost:8080` / `8180`) oder per Terminal (`curl` + `jq`) arbeiten möchte, findet Setup & Übung unter [Advanced A00](../../advanced/A00-lokales-labor-docker.md) und [Advanced A01](../../advanced/A01-http-curl-jq.md).

## 4. Typische Fallstricke und Troubleshooting

| Fehlerbild | Ursache | Lösung in Swagger UI / Browser |
| :--- | :--- | :--- |
| `415 Unsupported Media Type` | Request-Content-Type passt nicht (z. B. `text/plain` statt `application/json`) | Im *Parameter / Request body content type*-Dropdown **`application/json`** auswählen |
| `404 Not Found` beim Abrufen deiner Pet-ID | Öffentlicher Petstore wurde von anderen Teilnehmenden geleert oder ID fehlt noch | Zuerst `POST /pet` mit eigener, zufälliger ID (z. B. 6-stellig) ausführen |
| Öffentlicher Testserver antwortet kurz mit `502`/`503` oder Timeout | Hohe Auslastung auf der öffentlichen Sandbox (`petstore3.swagger.io` / `httpbin.org`) | Kurz warten, Alternative `https://httpbingo.org/` testen oder bei Bedarf eigenes Docker-Labor aus [A00](../../advanced/A00-lokales-labor-docker.md) starten |

## 5. Spickzettel (Cheat Sheet)

| Begriff | Kurz-Erklärung |
| :--- | :--- |
| **Swagger Web UI** | Interaktive API-Webseite direkt im Browser (*Try it out*) — 0 Installation |
| **Client / Server** | Fragesteller (Browser, Bruno) / Antwortgeber (API-Dienst) |
| **Header / Body** | Briefumschlag (Metadaten) / Paketinhalt (JSON oder XML) |
| **`200` / `404` / `415`** | Alles OK / Ressource nicht gefunden / Falsches Datenformat |

## 6. Querverweise

- **Übung:** [M01-uebung.md](../../02-uebungen/M01-uebung.md)
- **Musterlösung:** [M01-loesung.md](../../03-loesungen/M01-loesung.md)
- **Advanced (Docker-Labor & `curl`):** [A00-lokales-labor-docker.md](../../advanced/A00-lokales-labor-docker.md) & [A01-http-curl-jq.md](../../advanced/A01-http-curl-jq.md)
