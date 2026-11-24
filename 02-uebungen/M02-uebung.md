---
module_id: M02
title: "Swagger / OpenAPI (2.0, 3.0, 3.1) lesen & mit Bruno nutzen"
level: "Stufe 1 - Grundlagen"
duration_minutes: 120
tools: ["Bruno (OpenCollection YAML)", "Bruno CLI (bru)", "curl", "jq"]
standards: ["OpenAPI 3.0.3", "OpenAPI 3.1.0", "OpenCollection YAML 1.0.0"]
lab_services: ["petstore3"]
prerequisites: ["M00", "M01"]
---

# Übung M02: OpenAPI lesen & mit Bruno (OpenCollection YAML) nutzen

## 1. Szenario und Zielzustand

Dein Team übernimmt eine bestehende Petstore-REST-API (`http://localhost:8080/api/v3/openapi.json`). Du sollst den Vertrag inspizieren, eine sortenreine **OpenCollection-YAML-Collection** importieren, alle Hosts über ein `local`-Environment (`{{baseURL}}`) abstrahieren und mindestens vier Operationen sauber in Bruno und via `bru run` ausführen.

## 2. Aufgabenpakete

### Aufgabe A: OpenAPI-Anatomie per `curl` + `jq` entschlüsseln
1. Lade `http://localhost:8080/api/v3/openapi.json` und ermittle das `openapi`-Versionsfeld sowie alle definierten `components.schemas`-Namen.
2. Analysiere das Schema `Pet`: Welche Felder sind `required`, und welche erlaubten Werte besitzt `status` (`enum`)?

### Aufgabe B: OpenAPI-Import nach OpenCollection YAML
1. Importiere `http://localhost:8080/api/v3/openapi.json` mittels `bru import openapi` in ein temporäres Verzeichnis `/tmp/my-petstore-yaml` im Format `opencollection`.
2. Inspiziere die erzeugte Verzeichnisstruktur (`opencollection.yml`, Unterordner, `.yml`-Requestdateien) und vergleiche sie mit [collections/bruno/petstore-lab/](../collections/bruno/petstore-lab/opencollection.yml).

### Aufgabe C: Parametrisierung & vier Operationen ausführen
Öffne [collections/bruno/petstore-lab/](../collections/bruno/petstore-lab/opencollection.yml) (oder deine importierte Collection), stelle sicher, dass kein Request einen hartkodierten Host (`localhost:8080`) enthält, sondern `{{baseURL}}` nutzt, und führe mindestens vier Petstore-Operationen (`POST /pet`, `GET /pet/findByStatus`, `GET /pet/:petId`, `DELETE /pet/:petId`) sowohl im GUI als auch per `bru run -r --env local` fehlerfrei aus.

### Bonus-Challenge D: OpenAPI 3.0 → 3.1 Migration skizzieren
Schreibe ein kleines OpenAPI-3.1-Snippet für ein `Pet`-Objekt, in dem `photoUrls` optional `null` sein darf (`type: ["array", "null"]`) und ein Top-Level-`webhooks`-Eintrag `petAdopted` definiert ist.

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Wie prüft man Schema-Details und required-Felder mit jq?</summary>

Schemas liegen unter `.components.schemas.<Name>`. Mit `keys` listest du alle Schema-Namen auf, und unter `.properties.status.enum` findest du die erlaubten Statuswerte von `Pet`.

</details>

<details>
<summary>Tipp 2 (Konkret): Konkrete Kommandos für Aufgabe A und B</summary>

```bash
# Schema-Namen und Pet-Definition inspizieren
curl -sS http://localhost:8080/api/v3/openapi.json | jq '.components.schemas | keys'
curl -sS http://localhost:8080/api/v3/openapi.json | jq '.components.schemas.Pet | {required, status_enum: .properties.status.enum}'

# CLI-Import als OpenCollection YAML
bru import openapi \
  --source http://localhost:8080/api/v3/openapi.json \
  --output /tmp/my-petstore-yaml \
  --collection-name "My Petstore" \
  --collection-format=opencollection
```

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] `openapi`-Version, `required`-Felder und `enum`-Werte von `Pet` wurden korrekt ermittelt.
- [ ] Die importierte bzw. genutzte Bruno-Collection enthält `opencollection.yml` (`opencollection: 1.0.0`) und **keine** `.bru`-Dateien.
- [ ] Keine Request-Datei enthält hartkodierte Hostnamen (`{{baseURL}}` wird konsequent verwendet).
- [ ] `bru run -r --env local` läuft in `collections/bruno/petstore-lab` mit Exit-Code `0` durch.
