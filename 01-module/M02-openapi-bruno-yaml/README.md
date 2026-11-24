---
module_id: M02
title: "Swagger / OpenAPI (2.0, 3.0, 3.1) lesen & mit Bruno nutzen"
level: "Stufe 1 - Grundlagen"
duration_minutes: 120
tools: ["Bruno (OpenCollection YAML)", "Bruno CLI (bru)", "curl", "jq"]
standards: ["OpenAPI 3.0.3", "OpenAPI 3.1.0", "JSON Schema 2020-12", "OpenCollection YAML 1.0.0"]
lab_services: ["petstore3"]
prerequisites: ["M00", "M01"]
---

# Modul 2: Swagger / OpenAPI (2.0, 3.0, 3.1) lesen & mit Bruno nutzen

## 1. Lernziele

Nach Abschluss dieses Moduls kannst du:
1. Die Struktur eines OpenAPI-Dokuments (`openapi`, `info`, `servers`, `paths`, `webhooks`, `components.schemas`, `$ref`) systematisch **lesen** und interpretieren.
2. Unterschiede zwischen **Swagger 2.0**, **OpenAPI 3.0** und **OpenAPI 3.1** (JSON-Schema-Angleichung, nullable-Typen, `webhooks`) präzise **einordnen**.
3. OpenAPI-Spezifikationen sowohl über die Bruno-GUI als auch automatisiert über `bru import openapi` in das **OpenCollection-YAML-Format (`.yml`)** **überführen**.
4. Umgebungen (`environments/local.yml`) mit `{{baseURL}}` in Bruno sauber parametrisieren und Änderungen im Git-Diff **prüfen**.

## 2. Architektur und Kernkonzepte

Eine **OpenAPI-Spezifikation (OAS)** ist der maschinenlesbare Vertrag einer REST-API. Sie beschreibt *welche* Endpunkte, HTTP-Methoden, Parameter (`path`, `query`, `header`, `cookie`), Request-Bodies, Response-Schemas und Sicherheitsverfahren existieren — jedoch keine konkreten Testabläufe.

### Vergleichstabelle: Swagger 2.0 vs. OpenAPI 3.0 vs. OpenAPI 3.1

| Merkmal | Swagger 2.0 (2014) | OpenAPI 3.0 (2017) | OpenAPI 3.1 (2021) |
| :--- | :--- | :--- | :--- |
| **Root-Feld** | `swagger: "2.0"` | `openapi: "3.0.3"` | `openapi: "3.1.0"` |
| **Server-Basis** | `host`, `basePath`, `schemes` | `servers: [{ url, variables }]` | `servers: [{ url, variables }]` |
| **Komponenten** | `definitions`, `parameters`, `securityDefinitions` | `components.schemas`, `components.securitySchemes` | `components.schemas`, `components.securitySchemes` |
| **JSON Schema** | Eingeschränkte Teilmenge (Draft-04-nah) | Draft-05-Superset (`nullable: true`) | **Vollständig JSON Schema Draft 2020-12** (`type: ["string", "null"]`) |
| **`$ref`-Geschwisterfelder** | Verboten | Ignoriert | Erlaubt (`$ref` neben `description` / `summary`) |
| **Asynchrone Events** | Nicht vorhanden | `callbacks` (an Operation) | Top-Level **`webhooks`** + `callbacks` |
| **Mutual TLS** | Nicht vorhanden | Nur prosaisch | Erstklassig über `type: mutualTLS` (ab M06) |

### Warum sortenreines OpenCollection YAML in Bruno?

Bruno v3/v4 standardisiert auf **OpenCollection YAML** (`opencollection.yml` im Collection-Root + `.yml`-Dateien für Requests, Ordner und Umgebungen). Gegenüber dem älteren `.bru`-Format bietet YAML natives Syntax-Highlighting in Git-Diffs, JSON-Schema-Validierung und volle Kompatibilität zu CI-Tools. **Wichtig:** `.bru`- und `.yml`-Dateien dürfen innerhalb derselben Collection niemals gemischt werden.

## 3. Geführter Walkthrough (`curl` & `Bruno`)

### `curl`: OpenAPI-Spezifikation inspizieren

```bash
# OpenAPI-Version, Titel und Server-URLs des lokalen Petstore auslesen
curl -sS http://localhost:8080/api/v3/openapi.json \
  | jq '{openapi, title: .info.title, version: .info.version, servers}'

# Alle vorhandenen Pfade und HTTP-Methoden kompakt auflisten
curl -sS http://localhost:8080/api/v3/openapi.json \
  | jq '.paths | to_entries[] | {path: .key, methods: (.value | keys)}'
```

### `Bruno CLI` & `Bruno GUI`: OpenAPI importieren und parametrisieren

1. **Per Bruno CLI (OpenCollection YAML erzwingen):**
   ```bash
   bru import openapi \
     --source http://localhost:8080/api/v3/openapi.json \
     --output /tmp/petstore-imported \
     --collection-name "Petstore Imported" \
     --collection-format=opencollection
   ```
2. **Per Bruno GUI:** *Collections → `+` → Import Collection → OpenAPI V3 Specification* → URL `http://localhost:8080/api/v3/openapi.json` → Format **OpenCollection (YAML)** wählen.
3. **Vorkonfigurierte Kurs-Collection öffnen:** Öffne in Bruno den Ordner `collections/bruno/petstore-lab/`.
4. **Umgebung `local` prüfen (`environments/local.yml`):**
   ```yaml
   name: local
   variables:
     - name: baseURL
       value: http://localhost:8080/api/v3
   ```
5. **CLI-Lauf prüfen:**
   ```bash
   cd collections/bruno/petstore-lab
   bru run -r --env local
   ```

## 4. Typische Fallstricke und Troubleshooting

| Fehlerbild | Ursache | Diagnose & Lösung |
| :--- | :--- | :--- |
| Bruno erkennt importierte Collection nicht | `opencollection.yml` fehlt oder enthält kein `opencollection: 1.0.0` | Erste Zeile von `opencollection.yml` prüfen; `info.name` statt Root-`name` verwenden |
| Requests verschwinden im Bruno GUI | Mischung von `.bru`- und `.yml`-Dateien im selben Collection-Ordner | `find . -name "*.bru"` prüfen und Collection sortenrein als YAML führen |
| `bru run` überspringt Requests in Unterordnern | Aufruf von `bru run` ohne `-r` (recursive) | Immer `bru run -r --env local` im Collection-Root ausführen |
| Request schlägt gegen `{{baseURL}}` fehl | Keine aktive Umgebung ausgewählt (Standard `No environment`) | Im Bruno GUI oben rechts `local` wählen oder per CLI `--env local` übergeben |

## 5. Spickzettel (Cheat Sheet)

| Element / Befehl | Bedeutung |
| :--- | :--- |
| `bru import openapi -s <url> -o <dir> --collection-format=opencollection` | Importiert OpenAPI-Spec direkt als OpenCollection YAML |
| `opencollection: 1.0.0` | Pflicht-Header in `opencollection.yml` |
| `{{baseURL}}/pet/:petId` | Kombination aus Environment-Variable und Bruno-Path-Parameter |
| `type: ["string", "null"]` | OpenAPI 3.1 / JSON Schema 2020-12 Schreibweise für `nullable` |
| `bru run -r --env local` | Rekursive CLI-Ausführung einer Collection mit Umgebung `local` |

## 6. Querverweise

- **Übung:** [M02-uebung.md](../../02-uebungen/M02-uebung.md)
- **Musterlösung:** [M02-loesung.md](../../03-loesungen/M02-loesung.md)
- **Bruno Collection:** [collections/bruno/petstore-lab](../../collections/bruno/petstore-lab/opencollection.yml)
