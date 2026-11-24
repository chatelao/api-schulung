---
module_id: M06
title: "OpenAPI securitySchemes & kombinierte Sicherheitsanforderungen"
level: "Stufe 2 - Sicherheit"
duration_minutes: 75
tools: ["Bruno (OpenCollection YAML)", "OpenAPI-Editor", "curl", "jq"]
standards: ["OpenAPI 3.1.0", "OpenAPI 3.2 (Ausblick)", "RFC 8414", "RFC 8628"]
lab_services: ["go-httpbin", "tls-proxy"]
prerequisites: ["M02", "M05"]
---

# Modul 6: OpenAPI `securitySchemes` & kombinierte Sicherheitsanforderungen

## 1. Lernziele

Nach Abschluss dieses Moduls kannst du:
1. Alle fünf `securitySchemes`-Typen in **OpenAPI 3.1** (`apiKey`, `http`, `mutualTLS`, `oauth2`, `openIdConnect`) korrekt definieren und in Bruno nachvollziehen.
2. Den Unterschied zwischen **Deklaration** (`components.securitySchemes`) und **Aktivierung** (`security` global bzw. pro Operation) sicher erklären.
3. Kombinierte **ODER**- vs. **UND**-Sicherheitsregeln sowie optionale (`{}`) und explizit öffentliche (`security: []`) Endpunkte fehlerfrei **modellieren**.
4. Die Erweiterungen von **OpenAPI 3.2** (`oauth2MetadataUrl` nach RFC 8414, `flows.deviceAuthorization` nach RFC 8628) als Ausblick **einordnen**.

## 2. Architektur und Kernkonzepte

Ein häufiges Missverständnis in OpenAPI-Verträgen besteht zwischen der blossen Definition eines Sicherheitsschemas unter `components.securitySchemes` und seiner tatsächlichen Aktivierung über das `security`-Array.

### Vergleichstabelle: Die fünf OpenAPI-3.1-Sicherheitstypen

| `type` | Relevante Pflichtfelder | Ab OpenAPI-Version | Typischer Einsatz |
| :--- | :--- | :--- | :--- |
| `apiKey` | `name`, `in` (`header`, `query`, `cookie`) | 2.0 / 3.0 / 3.1 | Service-Keys im Header (`X-Api-Key`) |
| `http` | `scheme` (`basic`, `bearer`), optional `bearerFormat: JWT` | 3.0 / 3.1 | HTTP Basic oder Bearer JWT |
| `mutualTLS` | Keine (nur `description`) | **Erst ab 3.1!** | Client-Zertifikate auf TLS-Ebene |
| `oauth2` | `flows` (`authorizationCode`, `clientCredentials`, ...) | 3.0 / 3.1 | OAuth 2.0 / 2.1 (PKCE, M2M) |
| `openIdConnect` | `openIdConnectUrl` (`/.well-known/openid-configuration`) | 3.0 / 3.1 | Dynamische OIDC-Discovery |

*(Ausblick **OpenAPI 3.2**: Ergänzt `oauth2MetadataUrl` gemäss RFC 8414 und den `deviceAuthorization`-Flow gemäss RFC 8628.)*

### Die drei goldenen `security`-Regeln (UND vs. ODER)

1. **Ohne `security`-Referenz keine Wirkung:** Ein Schema unter `components.securitySchemes` ist nur ein Baustein — erst die Referenz im Root-`security` oder Operations-`security` erzwingt es.
2. **Array-Einträge = ODER; Schlüssel im selben Objekt = UND:**
   ```yaml
   security:
     - apiKeyAuth: []     # ODER: nur API-Key
     - bearerAuth: []     # ODER: nur Bearer
     - mtlsAuth: []       # UND: Client muss BEIDE gleichzeitig liefern!
       oauth2Auth: ["orders:admin"]
   ```
3. **Ausnahmen explizit setzen:**
   - `security: []` auf Operationsebene **überschreibt** globale Sicherheitsanforderungen vollständig (z. B. für `/health`).
   - `{}` als Eintrag im `security`-Array erlaubt **optionalen anonymen Zugriff** (mit oder ohne Key).

## 3. Geführter Walkthrough (`OpenAPI` & `Bruno`)

### Schritt 1: Die Demodatei `openapi-security-demo.yaml` analysieren

Inspiziere [openapi-security-demo.yaml](openapi-security-demo.yaml). Sie definiert vier praxisnahe Endpunkte:
- `GET /health` → `security: []` (komplett öffentlich, überschreibt globales `security`).
- `GET /orders` → `apiKeyAuth` **ODER** `bearerAuth` (zwei separate Array-Objekte).
- `GET /catalog` → `{}` **ODER** `apiKeyAuth` (anonymer Zugriff erlaubt, API-Key optional).
- `POST /admin/audit` → `mtlsAuth` **UND** `oauth2Auth: ["orders:admin"]` (beide Schlüssel im selben Objekt).

### Schritt 2: Import nach Bruno (OpenCollection YAML)

```bash
bru import openapi \
  --source 01-module/M06-openapi-security-schemes/openapi-security-demo.yaml \
  --output /tmp/openapi-sec-demo \
  --collection-name "OpenAPI Security Demo" \
  --collection-format=opencollection
```

Öffne das Ergebnis oder prüfe die generierten `.yml`-Dateien: Bruno erkennt die hinterlegten Auth-Typen (`apikey`, `bearer`, `oauth2`) direkt auf Request-Ebene. Beachte dabei, dass `mutualTLS` in OpenAPI 3.1 auf Transportebene deklariert wird und in Bruno/CLI über Client-Zertifikate (Modul 7) erfüllt werden muss.

## 4. Typische Fallstricke und Troubleshooting

| Fehlerbild | Ursache | Diagnose & Lösung |
| :--- | :--- | :--- |
| Swagger UI / Bruno zeigt kein Schloss-Symbol | Schema unter `components.securitySchemes` definiert, aber `security:` vergessen | Globales oder operationsbezogenes `security:` ergänzen |
| API verlangt fälschlich zwei Tokens gleichzeitig | Zwei Schemas in **einem** Objekt statt in zwei Listen-Einträgen notiert | `- schemeA: []` und `- schemeB: []` als getrennte Listeneinträge (ODER) schreiben |
| `/health` verlangt trotzdem Auth | Globales `security` wirkt, weil `security: []` auf `/health` fehlt | Auf `/health` explizit `security: []` setzen |
| Validator lehnt `type: mutualTLS` ab | Datei hat noch `openapi: 3.0.3` im Header | Auf `openapi: 3.1.0` hochstufen |

## 5. Spickzettel (Cheat Sheet)

| YAML-Pattern | Bedeutung |
| :--- | :--- |
| `security: []` | Keine Authentifizierung (hebt globales `security` auf) |
| `security: [ {}, { apiKey: [] } ]` | Optional authentifiziert (anonym ODER API-Key) |
| `security: [ { a: [] }, { b: [] } ]` | Entweder `a` **ODER** `b` |
| `security: [ { a: [] , b: ["scope"] } ]` | `a` **UND** `b` mit Scope gleichzeitig |
| `type: mutualTLS` | Erst ab OpenAPI `3.1.0` gültig |

## 6. Querverweise

- **Übung:** [M06-uebung.md](../../02-uebungen/M06-uebung.md)
- **Musterlösung:** [M06-loesung.md](../../03-loesungen/M06-loesung.md)
- **Demo-Spec:** [openapi-security-demo.yaml](openapi-security-demo.yaml)
