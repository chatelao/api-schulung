---
module_id: M02
title: "Swagger / OpenAPI (2.0, 3.0, 3.1) lesen & mit Bruno nutzen"
level: "Stufe 1 - Grundlagen"
duration_minutes: 120
tools: ["Webbrowser (Swagger Web UI)", "Bruno Desktop (OpenCollection YAML)"]
standards: ["OpenAPI 3.0.3", "OpenAPI 3.1.0", "JSON Schema 2020-12", "OpenCollection YAML 1.0.0"]
lab_services: ["public (petstore3.swagger.io, httpbin.org)", "optional A00: petstore3"]
prerequisites: ["M00", "M01"]
---

# Modul 2: Swagger / OpenAPI (2.0, 3.0, 3.1) lesen & mit Bruno nutzen

## 1. Lernziele

Nach Abschluss dieses Moduls kannst du:
1. Die Struktur eines **OpenAPI-Dokuments** (`openapi`, `info`, `servers`, `paths`, `webhooks`, `components.schemas`, `$ref`) systematisch **lesen** und direkt mit einer Swagger Web UI vergleichen.
2. Unterschiede zwischen **Swagger 2.0**, **OpenAPI 3.0** und **OpenAPI 3.1** (JSON-Schema-Angleichung, nullable-Typen, `webhooks`) präzise **einordnen**.
3. Eine öffentliche OpenAPI-Spezifikation über **Bruno Desktop** direkt in das **OpenCollection-YAML-Format (`.yml`)** **importieren**.
4. Umgebungen (`public` vs. `local` mit `{{baseURL}}`) in Bruno nutzen, sodass keine Server-Adressen hartkodiert werden.

## 2. Architektur und Kernkonzepte

Eine **OpenAPI-Spezifikation (OAS)** ist der digitale Bauplan (Vertrag) einer REST-API. Genau aus dieser JSON- oder YAML-Datei erzeugen Webseiten wie **`https://petstore3.swagger.io/`** oder **`https://httpbin.org/`** automatisch ihre klickbare **Swagger Web UI**!

Wenn du von der Swagger Web UI im Browser auf **Bruno Desktop** wechselst, gewinnst du vor allem drei Vorteile:
- Deine eigenen Test-Requests und Antworten bleiben als **Collection** gespeichert.
- Du kannst Zugangsdaten und Server-Adressen sauber über **Environments (`public` / `local`)** umschalten.
- Du kannst Requests automatisch testen und per Git im Team teilen (**OpenCollection YAML**).

### Vergleichstabelle: Swagger 2.0 vs. OpenAPI 3.0 vs. OpenAPI 3.1

| Merkmal | Swagger 2.0 (2014) | OpenAPI 3.0 (2017) | OpenAPI 3.1 (2021) |
| :--- | :--- | :--- | :--- |
| **Root-Feld** | `swagger: "2.0"` | `openapi: "3.0.3"` | `openapi: "3.1.0"` |
| **Server-Basis** | `host`, `basePath`, `schemes` | `servers: [{ url, variables }]` | `servers: [{ url, variables }]` |
| **Komponenten** | `definitions`, `securityDefinitions` | `components.schemas`, `components.securitySchemes` | `components.schemas`, `components.securitySchemes` |
| **Leere / Null-Werte** | Nicht standardisiert | `nullable: true` | **JSON Schema 2020-12:** `type: ["string", "null"]` |
| **Asynchrone Events** | Nicht vorhanden | `callbacks` | Top-Level **`webhooks`** + `callbacks` |
| **Mutual TLS** | Nicht vorhanden | Nur Textbeschreibung | Erstklassig über `type: mutualTLS` (ab M06) |

### Sortenreines OpenCollection YAML in Bruno

Bruno speichert jede Anfrage als übersichtliche Textdatei im **OpenCollection-YAML-Format** (`opencollection.yml` im Hauptordner + `.yml`-Dateien für Requests und Umgebungen). **Wichtig:** Das ältere `.bru`-Format und `.yml`-Dateien dürfen innerhalb derselben Collection niemals gemischt werden.

## 3. Geführter Walkthrough (`Browser` & `Bruno Desktop`)

### Schritt 1: Zwei echte OpenAPI-/Swagger-Specs im Browser vergleichen

1. Öffne **`https://petstore3.swagger.io/api/v3/openapi.json`** im Browser: Finde `openapi` (`3.0.x`), `info.title`, `servers` und unter `components.schemas.Pet` die Pflichtfelder (`required`: `["name", "photoUrls"]`) sowie erlaubte `status`-Werte (`["available", "pending", "sold"]`).
2. Öffne zum Vergleich **`https://httpbin.org/spec.json`**: Das Root-Feld lautet **`"swagger": "2.0"`** — daran siehst du den direkten Unterschied zwischen Swagger 2.0 und OpenAPI 3.0!

### Schritt 2: Import in Bruno Desktop (OpenCollection YAML, ohne Docker)

1. Öffne **Bruno Desktop** → klicke oben links auf **`+` → Import Collection → OpenAPI V3 Specification**.
2. Gib als URL **`https://petstore3.swagger.io/api/v3/openapi.json`** ein.
3. Achte im Import-Dialog darauf, dass als File Format **OpenCollection (YAML)** ausgewählt ist.
4. Öffne alternativ direkt die vorbereitete Kurs-Collection **`collections/bruno/petstore-lab/`** (*Open Collection*).

### Schritt 3: Umgebung `public` (`{{baseURL}}`) aktivieren

1. Klicke in Bruno oben rechts auf das Environment-Dropdown (*No Environment*) und wähle **`public`** (Adresse: `https://petstore3.swagger.io/api/v3`).
2. Falls du später offline mit dem eigenen Docker-Labor ([Advanced A00](../../advanced/A00-lokales-labor-docker.md)) arbeitest, schaltest du oben rechts einfach von `public` auf **`local`** (`http://localhost:8080/api/v3`) um — ohne einen einzigen Request zu ändern!
3. Führe alle 4 Requests unter `pets/` der Reihe nach über **Send** aus (`01-create-pet`, `02-find-by-status`, `03-get-pet-by-id`, `04-delete-pet`).

> **Für Fortgeschrittene (CLI-Import & CI):** Wie man OpenAPI-Specs per Kommandozeile mit `bru import openapi` importiert und ausführt, zeigt [Advanced A06](../../advanced/A06-token-lifecycle-bruno-cli-cicd.md).

## 4. Typische Fallstricke und Troubleshooting

| Fehlerbild | Ursache | Diagnose & Lösung |
| :--- | :--- | :--- |
| Bruno erkennt einen Collection-Ordner nicht | `opencollection.yml` fehlt oder enthält kein `opencollection: 1.0.0` | Prüfe, ob `opencollection.yml` im Wurzelordner liegt |
| Requests verschwinden nach Bearbeitung im GUI | Mischung von `.bru`- und `.yml`-Dateien im selben Ordner | Nur sortenreines OpenCollection YAML (`.yml`) verwenden |
| Request schlägt fehl mit `Invalid URL {{baseURL}}/pet` | Oben rechts ist noch *No Environment* ausgewählt | Im Environment-Dropdown explizit **`public`** (oder **`local`** bei Docker-Labor) auswählen |

## 5. Spickzettel (Cheat Sheet)

| Begriff / Syntax | Bedeutung |
| :--- | :--- |
| `https://petstore3.swagger.io/api/v3/openapi.json` | Öffentlicher OpenAPI-3.0-Vertrag des Petstore |
| `https://httpbin.org/spec.json` | Öffentliche Swagger-2.0-Spezifikation von HTTPBin |
| `opencollection: 1.0.0` | Pflicht-Header in `opencollection.yml` |
| `{{baseURL}}/pet/:petId` | Kombination aus Umgebungs- und Pfad-Variable in Bruno |
| `type: ["string", "null"]` | OpenAPI-3.1-Schreibweise für optionale `null`-Werte |

## 6. Querverweise

- **Übung:** [M02-uebung.md](../../02-uebungen/M02-uebung.md)
- **Musterlösung:** [M02-loesung.md](../../03-loesungen/M02-loesung.md)
- **Bruno Collection:** [collections/bruno/petstore-lab](../../collections/bruno/petstore-lab/opencollection.yml)
