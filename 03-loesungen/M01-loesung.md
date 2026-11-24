# Musterlösung M01: HTTP-Fundament in öffentlichen Swagger Web UIs

## Lösung Aufgabe A: Echo & Statuscodes (`https://httpbin.org/`)
1. Unter `GET /headers` spiegelt HTTPBin im JSON-Feld `"headers"` alle vom Browser gesendeten Request-Header (`Accept`, `Accept-Language`, `User-Agent` usw.) wider.
2. Unter `GET /anything` zeigt HTTPBin genau die aufgerufene `url`, `method: "GET"` und `origin`.
3. Unter `GET /status/{codes}` liefert der Server exakt den gewünschten HTTP-Statuscode (`200`, `404`, `418`) zurück.

## Lösung Aufgabe B: Fehlercodes verstehen (`https://petstore3.swagger.io/`)
- **`404 Not Found`:** `GET /pet/99999999` — diese ID existiert nicht im Petstore.
- **`415 Unsupported Media Type`:** `POST /api/v3/pet` mit Body-Typ **Text** (`Content-Type: text/plain`) — der Server erwartet JSON oder XML.
- **`405 Method Not Allowed`:** `DELETE /api/v3/pet` — `DELETE` ist nur mit angehängter ID (`/pet/{petId}`) erlaubt.

## Lösung Aufgabe C: CRUD-Ablauf in Petstore3 Swagger Web UI
1. `POST /pet` mit `"id": 202611`, `"name": "Luna"`, `"status": "available"` → **`200 OK`**.
2. `GET /pet/202611` → liefert `"name": "Luna"`.
3. `PUT /pet` mit `"id": 202611`, `"status": "sold"` → **`200 OK`**.
4. `DELETE /pet/202611` → **`200 OK`**; ein erneutes `GET /pet/202611` liefert **`404 Not Found`**.

*(Für die automatisierte Bash-/curl-Variante gegen das eigene Container-Labor siehe [Advanced-Musterlösungen](../advanced/loesungen.md).)*
