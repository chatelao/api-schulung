---
module_id: M02
title: "Swagger / OpenAPI (2.0, 3.0, 3.1) lesen & mit Bruno nutzen"
level: "Stufe 1 - Grundlagen"
duration_minutes: 120
tools: ["Webbrowser (Swagger Web UI)", "Bruno Desktop (OpenCollection YAML)"]
standards: ["OpenAPI 3.0.3", "OpenAPI 3.1.0", "OpenCollection YAML 1.0.0"]
lab_services: ["public (petstore3.swagger.io, httpbin.org)", "optional A00: petstore3"]
prerequisites: ["M00", "M01"]
---

# Übung M02: Öffentliche OpenAPI-Verträge lesen & mit Bruno nutzen

## 1. Szenario und Zielzustand

Dein Team übernimmt die öffentliche Petstore-REST-API (`https://petstore3.swagger.io/api/v3/openapi.json`). Du liest den Vertrag direkt im Browser, vergleichst ihn mit der Swagger-2.0-Spec von HTTPBin (`https://httpbin.org/spec.json`), importierst ihn in **Bruno Desktop** (OpenCollection YAML) und führst die Operationen gegen das vorbereitete **`public`-Environment** ganz ohne eigene Container aus.

## 2. Aufgabenpakete

### Aufgabe A: OpenAPI- vs. Swagger-Anatomie im Browser entschlüsseln
1. Öffne `https://petstore3.swagger.io/api/v3/openapi.json` im Browser (oder kopiere den Inhalt in einen JSON-Viewer).
2. Ermittle die exakte `openapi`-Versionsnummer und notiere die Namen von mindestens drei Schemas unter `components.schemas`.
3. Analysiere das Schema `Pet`: Welche Felder sind `required` und welche erlaubten Werte besitzt `status` (`enum`)?
4. Öffne zum Vergleich `https://httpbin.org/spec.json` und notiere drei Unterschiede zu OpenAPI 3.0 (`swagger`-Version, `host`/`basePath`, `paths`).

### Aufgabe B: OpenAPI-Import in Bruno Desktop (OpenCollection YAML)
1. Importiere `https://petstore3.swagger.io/api/v3/openapi.json` über **Bruno Desktop** (`+ → Import Collection → URL`) im Format **OpenCollection (YAML)** in einen beliebigen lokalen Ordner.
2. Vergleiche die im Dateimanager angelegten `.yml`-Dateien (`opencollection.yml` + Unterordner) mit unserer Kurs-Collection [collections/bruno/petstore-lab/](../collections/bruno/petstore-lab/opencollection.yml).

### Aufgabe C: Parametrisierung (`public`-Environment) & vier Operationen ausführen
Öffne [collections/bruno/petstore-lab/](../collections/bruno/petstore-lab/opencollection.yml) in Bruno Desktop, aktiviere oben rechts das Environment **`public`** (`{{baseURL}}` = `https://petstore3.swagger.io/api/v3`) und führe die vier Operationen (`01-create-pet`, `02-find-by-status`, `03-get-pet-by-id`, `04-delete-pet`) nacheinander aus.

*(Hinweis: Falls du die Collection auf einer öffentlichen Sandbox mit vielen parallelen Nutzern ausführst, passe die `id` im JSON-Body bei `01-create-pet` auf einen eigenen 6-stelligen Wert an.)*

### Bonus-Challenge D: OpenAPI 3.0 → 3.1 Migration skizzieren
Schreibe ein kleines OpenAPI-3.1-YAML-Snippet für ein `Pet`-Objekt, in dem `photoUrls` optional `null` sein darf (`type: ["array", "null"]`) und ein Top-Level-`webhooks`-Eintrag `petAdopted` definiert ist.

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Wo findet man Pflichtfelder im OpenAPI-Schema?</summary>

Suche in `openapi.json` nach `"Pet": {`. Direkt innerhalb dieses Objekts stehen die Listen `"required": [...]` sowie unter `"properties"` → `"status"` die erlaubten `"enum"`-Werte.

</details>

<details>
<summary>Tipp 2 (Konkret): Richtige Reihenfolge der Requests in Bruno</summary>

1. Environment oben rechts auf **`public`** (bzw. `local` mit Docker aus `A00`) stellen.
2. Zuerst `01-create-pet` senden.
3. Danach `02-find-by-status` senden.
4. Dann `03-get-pet-by-id` senden.
5. Zuletzt `04-delete-pet` senden.

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] `openapi`-Version (`3.0.x`), `required`-Felder und `enum`-Werte von `Pet` sowie Unterschiede zu Swagger 2.0 (`httpbin.org/spec.json`) wurden ermittelt.
- [ ] Die importierte Bruno-Collection enthält `opencollection.yml` (`opencollection: 1.0.0`) und **keine** `.bru`-Dateien.
- [ ] Die Operationen in `petstore-lab` liefern über `{{baseURL}}` (Environment `public`) Status `200 OK`.
