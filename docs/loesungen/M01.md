# Musterlösung M01: HTTP-Fundament & erste API-Requests (Swagger UI & Bruno)

## Lösung Aufgabe A: Echo & Redirects
1. In Bruno unter `GET http://localhost:8180/anything/kurs` mit Header `X-Kurs-Teilnehmer: api-student` erscheint der Header in der JSON-Antwort unter `"headers": { "X-Kurs-Teilnehmer": ["api-student"] }`.
2. Bruno folgt den Weiterleitungen von `/redirect/2` standardmässig automatisch und endet bei **`200 OK`**.

## Lösung Aufgabe B: Fehlercodes verstehen
- **`415 Unsupported Media Type`:** `POST http://localhost:8080/api/v3/pet` mit Body-Typ **Text** (`Content-Type: text/plain`) — der Server erwartet JSON oder XML.
- **`404 Not Found`:** `GET http://localhost:8080/api/v3/pet/99999999` — diese ID existiert nicht.
- **`405 Method Not Allowed`:** `DELETE http://localhost:8080/api/v3/pet` — `DELETE` ist nur mit angehängter ID (`/pet/{petId}`) erlaubt.

## Lösung Aufgabe C: CRUD-Ablauf in Swagger UI (`http://localhost:8080`)
1. `POST /pet` mit `"id": 2026`, `"name": "Luna"`, `"status": "available"` → **`200 OK`**.
2. `GET /pet/2026` → liefert `"name": "Luna"`.
3. `PUT /pet` mit `"id": 2026`, `"status": "sold"` → **`200 OK`**.
4. `DELETE /pet/2026` → **`200 OK`**; ein erneutes `GET /pet/2026` liefert **`404 Not Found`**.

*(Für die automatisierte Bash-/curl-Variante siehe [Advanced-Musterlösungen](../advanced/loesungen.md).)*
