---
module_id: M01
title: "HTTP-Fundament & erste API-Requests ohne Shell-Vorkenntnisse"
level: "Stufe 1 - Grundlagen"
duration_minutes: 90
tools: ["Webbrowser (Swagger UI)", "Bruno Desktop (GUI)"]
standards: ["RFC 9110 (HTTP Semantics)", "HTTP/1.1 & HTTP/2", "JSON"]
lab_services: ["petstore3", "go-httpbin"]
prerequisites: ["M00"]
---

# Modul 1: HTTP-Fundament & erste API-Requests (visuell mit Swagger UI & Bruno)

## 1. Lernziele

Nach Abschluss dieses Moduls kannst du:
1. Den Aufbau einer **URL** (`Protokoll://Server:Port/Pfad?Abfrage`) und den Austausch zwischen **Client** und **Server** anschaulich **erklären**.
2. Eine HTTP-Nachricht (**Methode**, **Header**, **Body**, **Statuscode**) in einer grafischen Oberfläche sicher **lesen**.
3. Idempotente Operationen (`GET`, `PUT`, `DELETE`) von nicht-idempotenten Operationen (`POST`, `PATCH`) **unterscheiden**.
4. Erste CRUD-Requests (*Create, Read, Update, Delete*) und gezielte Fehlercodes (`400`, `404`, `405`, `415`) in **Swagger UI** und **Bruno Desktop** selbstständig **ausführen**.

## 2. Architektur und Kernkonzepte (ohne Netzwerk-Vorwissen)

Stell dir eine **API** (*Application Programming Interface*) wie ein Restaurant vor:
- **Du (der Browser, Bruno oder eine App)** bist der **Client** (Gast).
- **Das Backend-System (`petstore3`)** ist der **Server** (die Küche).
- **HTTP** ist die gemeinsame Bestellsprache zwischen euch beiden — jeder Austausch besteht aus einer **Anfrage (Request)** und einer **Antwort (Response)**.

### Anatomie einer Web-Adresse (URL)

```text
http://localhost:8080/api/v3/pet/findByStatus?status=available
\__/   \_______/ \__/\______________________/ \______________/
 |         |      |            |                     |
Protokoll Host   Port     Pfad (Ressource)    Query-Parameter
```

- **Host & Port:** `localhost` bedeutet *«dieser eigene Computer»*. Da auf einem Rechner mehrere Programme gleichzeitig laufen, bekommt jedes Programm eine eigene Türnummer (**Port**): Petstore nutzt `:8080`, unser Echo-Testserver `:8180`.
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

## 3. Geführter Walkthrough (Swagger UI & Bruno Desktop)

### Schritt 1: Erste Requests direkt im Browser (Swagger UI)

1. Öffne im Browser **`http://localhost:8080`**. Du siehst die interaktive **Swagger UI** des Petstore.
2. Klappe unter **pet** den grünen Balken **`GET /pet/findByStatus`** auf, klicke auf **Try it out**, wähle `status = available` und klicke **Execute**.
3. Sieh dir unter **Server response** den Statuscode **`200`** und die JSON-Liste der Tiere an.
4. Klappe **`POST /pet`** auf, klicke **Try it out**, ändere `"id": 1001` und `"name": "Bello"` und klicke **Execute**.
5. Prüfe unter **`GET /pet/{petId}`** mit `1001`, dass `"Bello"` gespeichert wurde, und lösche ihn anschliessend über **`DELETE /pet/{petId}`**.

### Schritt 2: Header & Fehlercodes in Bruno Desktop sichtbar machen

1. Öffne **Bruno Desktop** und lege eine temporäre Anfrage (*New Request*) an `http://localhost:8180/headers` (`GET`) an → Klicke **Send**.
2. Im rechten Antwortbereich siehst du im **Response Body**, welche Header dein Client automatisch mitgeschickt hat (`User-Agent`, `Accept` usw.).
3. Erstelle eine Anfrage `POST http://localhost:8080/api/v3/pet`, wähle im Tab **Body** den Typ **Text** (statt JSON!) und sende `Hallo` → Beobachte Status **`415 Unsupported Media Type`**.

> **Für Fortgeschrittene (Shell & `curl`):** Wer diese Schritte automatisiert im Terminal mit `curl` und `jq` durchführen möchte, findet das passende Aufbaumodul unter [Advanced A01: HTTP-Fundament & curl](../../advanced/A01-http-curl-jq.md).

## 4. Typische Fallstricke und Troubleshooting

| Fehlerbild | Ursache | Lösung in Bruno / Swagger UI |
| :--- | :--- | :--- |
| `415 Unsupported Media Type` | Im Body-Tab wurde *Text* statt *JSON* gewählt (`Content-Type: text/plain`) | Body-Typ in Bruno auf **JSON** umstellen (setzt automatisch `Content-Type: application/json`) |
| `404 Not Found` beim Abrufen von `1001` | Das Tier wurde vorher noch nicht angelegt oder bereits gelöscht | Zuerst `POST /pet` mit `"id": 1001` ausführen |
| `Connection refused` im Browser / in Bruno | Der lokale Docker-Container `petstore3` läuft noch nicht | Prüfe die Schritte in [M00: Labor-Setup](../../00-setup/README.md) |

## 5. Spickzettel (Cheat Sheet)

| Begriff | Kurz-Erklärung |
| :--- | :--- |
| **Client / Server** | Fragesteller (Bruno, Browser) / Antwortgeber (API-Dienst) |
| **Header** | Metadaten zum Request/Response (z. B. `Content-Type`, `Accept`) |
| **Body** | Der eigentliche JSON- oder XML-Inhalt einer Nachricht |
| **`200` / `404` / `415`** | Alles OK / Ressource nicht gefunden / Falsches Datenformat |

## 6. Querverweise

- **Übung:** [M01-uebung.md](../../02-uebungen/M01-uebung.md)
- **Musterlösung:** [M01-loesung.md](../../03-loesungen/M01-loesung.md)
- **Advanced (Shell/`curl`):** [A01-http-curl-jq.md](../../advanced/A01-http-curl-jq.md)
