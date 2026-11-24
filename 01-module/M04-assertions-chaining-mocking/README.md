---
module_id: M04
title: "Assertions, Request-Chaining, Scripting & Mocking"
level: "Stufe 1 - Grundlagen"
duration_minutes: 120
tools: ["Bruno (OpenCollection YAML)", "Bruno CLI (bru)", "SoapUI Open Source 5.10.1"]
standards: ["OpenCollection YAML 1.0.0", "Chai Assertions", "XPath 1.0/2.0", "XQuery", "Groovy"]
lab_services: ["petstore3", "soap-service"]
prerequisites: ["M02", "M03"]
---

# Modul 4: Assertions, Request-Chaining, Scripting & Mocking

## 1. Lernziele

Nach Abschluss dieses Moduls kannst du:
1. Deklarative **Assertions** und programmatische **Chai-Tests** in Bruno gezielt kombinieren und per `bru run` auswerten.
2. Dynamische Daten über **Request-Chaining** zwischen Requests weiterreichen und in Bruno sicher zwischen flüchtigen Runtime-Variablen (`bru.setVar()`) und persistenten Environment-Variablen (`bru.setEnvVar()`) **unterscheiden**.
3. In **SoapUI Open Source 5.10.1** Test-Hierarchien (`TestSuite → TestCase → TestSteps`), `XPath Match`-Assertions, `Property Transfer` Steps, einfache Groovy-Skripte sowie einen lokalen **SOAP MockService** **konfigurieren**.
4. Die Grenzen von SoapUI Open Source gegenüber **ReadyAPI** (z. B. codelose Excel/CSV-DataSource-Loops) transparent **einordnen**.

## 2. Architektur und Kernkonzepte

Einzelne manuelle Requests reichen für verlässliche Qualitätssicherung nicht aus: Antworten müssen automatisiert geprüft (**Assertions**), dynamische IDs/Tokens an Folgerequests übergeben (**Chaining**) und nicht verfügbare Drittsysteme lokal simuliert (**Mocking**) werden.

### Vergleichstabelle: Test- & Chaining-Konzepte in Bruno vs. SoapUI OS 5.10.1

| Konzept | Bruno (OpenCollection YAML) | SoapUI Open Source 5.10.1 |
| :--- | :--- | :--- |
| **Test-Struktur** | Collection → Folder (`folder.yml`) → Request (`.yml`) | Project → `TestSuite` → `TestCase` → `TestSteps` |
| **Deklarative Prüfung** | `runtime.assertions` (`eq`, `neq`, `isString`, `isNumber`) | `Contains`, `Not Contains`, `XPath Match`, `XQuery Match`, `JSONPath Match`, `SOAP Response` |
| **Skript-Sprache** | JavaScript + Chai (`expect(res.status).to.equal(200)`) | Groovy (`testRunner`, `context`, `XmlHolder`) |
| **Request-Chaining** | `after-response`-Skript mit `bru.setVar("id", res.body.id)` | `Property Transfer` TestStep (XPath-Quelle → Ziel-Request) oder Groovy-Property-Write |
| **Data-Driven Testing** | Nativ in CLI via `--csv-file-path` / `--json-file-path` | **Nicht codelos in OS enthalten!** (Excel/CSV-DataSource-Loops sind **ReadyAPI-only**; in OS nur über Groovy-Workarounds) |
| **Mocking** | Bruno Mock Server / lokale Dev-Server | Eingebauter **SOAP MockService** (lokaler HTTP-Port mit statischen oder Groovy-Dispatch-Antworten) |

### Kritischer Fallstrick in Bruno v4: `bru.setVar()` vs. `bru.setEnvVar()`

- **`bru.setVar("petId", ...)`**: Speichert die Variable **flüchtig im Arbeitsspeicher** für den aktuellen Run (ideal für IDs und Session-Tokens!).
- **`bru.setEnvVar("petId", ...)`**: Ändert die **Environment-Variable** und wird in Bruno v4 standardmässig **auf die Festplatte (`environments/*.yml`) persistiert** — was zu ungewollten Git-Diffs führt!

## 3. Geführter Walkthrough (`Bruno` & `SoapUI`)

### `Bruno` (Chaining + Tests + `bru run`)

Öffne [collections/bruno/petstore-lab](../../collections/bruno/petstore-lab/opencollection.yml) und inspiziere die Kette im Ordner `pets/`:
1. `01-create-pet.yml`: Legt `id: 4041` an und speichert die ID im `after-response`-Block:
   ```javascript
   bru.setVar("petId", String(res.body.id));
   ```
2. `03-get-pet-by-id.yml`: Ruft `{{baseURL}}/pet/{{petId}}` auf und prüft per Chai-Test:
   ```javascript
   test("Verkettete Pet-ID stimmt ueberein", function() {
     expect(res.status).to.equal(200);
     expect(String(res.body.id)).to.equal(String(bru.getVar("petId")));
   });
   ```
3. Ausführen per CLI (mit JUnit-Ausgabe für CI):
   ```bash
   cd collections/bruno/petstore-lab
   bru run -r --env local --reporter-junit /tmp/petstore-junit.xml
   ```

### `SoapUI Open Source 5.10.1` (`Property Transfer` + `XPath Match` + `MockService`)

Öffne das vorbereitete Projekt [order-service-soapui-project.xml](../../collections/soapui/order-service-soapui-project.xml) in SoapUI OS 5.10.1:
1. Öffne `OrderServiceTestSuite → OrderChainingTestCase`.
2. Ablauf der TestSteps:
   - **Step 1 (`CreateOrder`)**: Sendet einen gültigen Auftrag und prüft mit einer **SOAP Response** + **XPath Match** Assertion (`declare namespace tns='http://api-schulung.local/orders/v1'; exists(//tns:CreateOrderResponse/tns:orderId)`).
   - **Step 2 (`TransferOrderId`)**: *Property Transfer* liest `//tns:CreateOrderResponse/tns:orderId` aus Step 1 (`Response`) und schreibt ihn in `//tns:GetOrderRequest/tns:orderId` von Step 3 (`Request`).
   - **Step 3 (`GetOrder`)**: Ruft den zuvor erzeugten Auftrag ab und prüft per **XPath Match**, dass `<tns:status>` den Wert `CREATED` hat.
3. **SOAP MockService starten:** Rechtsklick auf `OrderServiceSoap11Binding → Generate MockService` (Port z. B. `8088`, Pfad `/mockOrderService`), grünen Play-Button klicken und eine Test-Antwort simulieren.

## 4. Typische Fallstricke und Troubleshooting

| Fehlerbild | Ursache | Diagnose & Lösung |
| :--- | :--- | :--- |
| `git status` zeigt ungewollte Änderungen in `environments/local.yml` | Im Post-Response-Skript wurde `bru.setEnvVar()` statt `bru.setVar()` genutzt | Auf `bru.setVar()` umstellen und `environments/*.yml` sauber zurücksetzen |
| XPath Match Assertion schlägt in SoapUI trotz vorhandenem Element fehl | XML-Namespace (`tns:`) wurde im XPath-Ausdruck nicht deklariert | Im XPath-Editor oben `Declare`-Button klicken oder `declare namespace tns='http://api-schulung.local/orders/v1';` voranstellen |
| Property Transfer kopiert leeren Wert | Falscher Quell- oder Ziel-Property-Typ (`ResponseAsXml` vs. `Response` / `Request`) | In SoapUI sicherstellen, dass Quelle `Response` und Ziel `Request` ausgewählt sind |
| `bru run` bricht bei `--csv-file-path` in Safe Mode ab | Skript nutzt Node-Module (`fs`), die `--sandbox=developer` benötigen | Standard-JavaScript/Chai benötigt nur `safe`-Mode; niemals unnötig `developer` verlangen |

## 5. Spickzettel (Cheat Sheet)

| Werkzeug | Konstrukt | Beispiel |
| :--- | :--- | :--- |
| **Bruno** | Runtime-Variable setzen/lesen | `bru.setVar("id", res.body.id)` / `bru.getVar("id")` |
| **Bruno** | Chai-Statusprüfung | `test("OK", () => expect(res.status).to.equal(200));` |
| **Bruno CLI** | Rekursiver Lauf mit Daten | `bru run -r --env local --csv-file-path data.csv` |
| **SoapUI** | XPath mit Namespace | `declare namespace tns='http://api-schulung.local/orders/v1'; //tns:status` |
| **SoapUI** | Groovy-Zugriff auf TestCase-Property | `testRunner.testCase.setPropertyValue("orderId", "ORD-1")` |

## 6. Querverweise

- **Übung:** [M04-uebung.md](../../02-uebungen/M04-uebung.md)
- **Musterlösung:** [M04-loesung.md](../../03-loesungen/M04-loesung.md)
- **Bruno Collection:** [petstore-lab](../../collections/bruno/petstore-lab/opencollection.yml)
- **SoapUI Projekt:** [order-service-soapui-project.xml](../../collections/soapui/order-service-soapui-project.xml)
