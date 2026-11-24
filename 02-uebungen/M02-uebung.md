---
module_id: M02
title: "Swagger / OpenAPI (2.0, 3.0, 3.1) lesen & mit Bruno nutzen"
level: "Stufe 1 - Grundlagen"
duration_minutes: 120
tools: ["Bruno Desktop (OpenCollection YAML)", "Webbrowser"]
standards: ["OpenAPI 3.0.3", "OpenAPI 3.1.0", "OpenCollection YAML 1.0.0"]
lab_services: ["petstore3"]
prerequisites: ["M00", "M01"]
---

# Übung M02: OpenAPI lesen & mit Bruno Desktop nutzen

## 1. Szenario und Zielzustand

Dein Team übernimmt eine bestehende Petstore-REST-API (`http://localhost:8080/api/v3/openapi.json`). Du sollst den Vertrag im Browser und in **Bruno Desktop** entschlüsseln, eine sortenreine **OpenCollection-YAML-Collection** importieren, alle Server-Adressen über ein `local`-Environment (`{{baseURL}}`) abstrahieren und vier Petstore-Operationen fehlerfrei ausführen.

## 2. Aufgabenpakete

### Aufgabe A: OpenAPI-Anatomie im Browser entschlüsseln
1. Öffne `http://localhost:8080/api/v3/openapi.json` im Browser (oder kopiere den Inhalt in einen JSON-Viewer).
2. Ermittle die exakte `openapi`-Versionsnummer und notiere die Namen von mindestens drei Schemas unter `components.schemas`.
3. Analysiere das Schema `Pet`: Welche Felder sind `required` und welche erlaubten Werte besitzt `status` (`enum`)?

### Aufgabe B: OpenAPI-Import in Bruno Desktop (OpenCollection YAML)
1. Importiere `http://localhost:8080/api/v3/openapi.json` über **Bruno Desktop** (`+ → Import Collection → URL`) im Format **OpenCollection (YAML)** in einen beliebigen lokalen Ordner.
2. Vergleiche die im Dateimanager angelegten `.yml`-Dateien (`opencollection.yml` + Unterordner) mit unserer Kurs-Collection [collections/bruno/petstore-lab/](../collections/bruno/petstore-lab/opencollection.yml).

### Aufgabe C: Parametrisierung & vier Operationen ausführen
Öffne [collections/bruno/petstore-lab/](../collections/bruno/petstore-lab/opencollection.yml) in Bruno Desktop, aktiviere oben rechts das Environment **`local`** (`{{baseURL}}`) und führe alle vier Petstore-Operationen (`01-create-pet`, `02-find-by-status`, `03-get-pet-by-id`, `04-delete-pet`) nacheinander aus.

### Bonus-Challenge D: OpenAPI 3.0 → 3.1 Migration skizzieren
Schreibe ein kleines OpenAPI-3.1-YAML-Snippet für ein `Pet`-Objekt, in dem `photoUrls` optional `null` sein darf (`type: ["array", "null"]`) und ein Top-Level-`webhooks`-Eintrag `petAdopted` definiert ist.

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Wo findet man Pflichtfelder im OpenAPI-Schema?</summary>

Suche in `openapi.json` nach `"Pet": {`. Direkt innerhalb dieses Objekts stehen die Listen `"required": [...]` sowie unter `"properties"` → `"status"` die erlaubten `"enum"`-Werte.

</details>

<details>
<summary>Tipp 2 (Konkret): Richtige Reihenfolge der Requests in Bruno</summary>

1. Zuerst `01-create-pet` senden (legt ID `4041` an).
2. Danach `02-find-by-status` senden.
3. Dann `03-get-pet-by-id` senden (nutzt die gespeicherte ID `4041`).
4. Zuletzt `04-delete-pet` senden (löscht ID `4041` wieder sauber).

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] `openapi`-Version (`3.0.x`), `required`-Felder und `enum`-Werte von `Pet` wurden ermittelt.
- [ ] Die importierte Bruno-Collection enthält `opencollection.yml` (`opencollection: 1.0.0`) und **keine** `.bru`-Dateien.
- [ ] Alle vier Operationen in `petstore-lab` liefern über `{{baseURL}}` (Environment `local`) Status `200 OK`.
