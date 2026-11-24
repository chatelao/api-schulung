---
module_id: M04
title: "Assertions, Request-Chaining, Scripting & Mocking"
level: "Stufe 1 - Grundlagen"
duration_minutes: 120
tools: ["Bruno Desktop (OpenCollection YAML)", "SoapUI Open Source 5.10.1"]
standards: ["OpenCollection YAML 1.0.0", "Chai Assertions", "XPath 1.0/2.0", "Groovy"]
lab_services: ["petstore3", "soap-service"]
prerequisites: ["M02", "M03"]
---

# Modul 4: Assertions, Request-Chaining, Scripting & Mocking

## 1. Lernziele

Nach Abschluss dieses Moduls kannst du:
1. Deklarative **Assertions** und geführte **Tests** in Bruno Desktop einrichten und über den integrierten **Collection Runner** ausführen.
2. Dynamische Werte über **Request-Chaining** zwischen Requests weiterreichen und in Bruno sicher zwischen flüchtigen Runtime-Variablen (`bru.setVar()`) und gespeicherten Umgebungs-Variablen (`bru.setEnvVar()`) **unterscheiden**.
3. In **SoapUI Open Source 5.10.1** Test-Hierarchien (`TestSuite → TestCase → TestSteps`), `XPath Match`-Assertions, `Property Transfer` Steps sowie einen lokalen **SOAP MockService** **konfigurieren**.
4. Die Grenzen von SoapUI Open Source gegenüber **ReadyAPI** (z. B. codelose Excel/CSV-DataSource-Loops) transparent **einordnen**.

## 2. Architektur und Kernkonzepte

Wenn eine API Antwortdaten liefert (z. B. eine neu vergebene Bestellnummer `ORD-42`), müssen wir diese für nachfolgende Schritte oft automatisch übernehmen (**Chaining**) und das Ergebnis automatisch prüfen (**Assertions**), statt Zahlen von Hand abzutippen.

### Vergleichstabelle: Test- & Chaining-Konzepte in Bruno Desktop vs. SoapUI OS 5.10.1

| Konzept | Bruno Desktop (OpenCollection YAML) | SoapUI Open Source 5.10.1 |
| :--- | :--- | :--- |
| **Test-Struktur** | Collection → Folder → Request (`.yml`) | Project → `TestSuite` → `TestCase` → `TestSteps` |
| **Einfache Prüfung ohne Code** | **Assert-Tab** (`res.status eq 200`) | `Contains`, `Not Contains`, `XPath Match`, `SOAP Response` |
| **Skript-Tests** | **Tests-Tab** (`expect(res.status).to.equal(200)`) | `Groovy Script` / `Script Assertion` |
| **Request-Chaining** | **Script-Tab (Post Response):** `bru.setVar("id", res.body.id)` | **`Property Transfer`** TestStep (XPath-Quelle → Ziel-Request) |
| **Data-Driven Testing** | Collection Runner mit CSV/JSON-Datei | **Nicht codelos in OS enthalten!** (Excel/CSV-DataSource-Loops sind **ReadyAPI-only**) |
| **Mocking** | Bruno Mock Server | Eingebauter **SOAP MockService** (lokaler HTTP-Port für Offline-Tests) |

### Kritischer Fallstrick in Bruno: `bru.setVar()` vs. `bru.setEnvVar()`

- **`bru.setVar("petId", ...)`**: Merkt sich den Wert **nur während des aktuellen Laufs im Arbeitsspeicher** (ideal für IDs!).
- **`bru.setEnvVar("petId", ...)`**: Schreibt die Änderung dauerhaft in die Datei `environments/local.yml` auf der Festplatte.

## 3. Geführter Walkthrough (`Bruno Desktop` & `SoapUI`)

### `Bruno Desktop` (Chaining + Assert-Tab + Collection Runner)

1. Öffne [collections/bruno/petstore-lab](../../collections/bruno/petstore-lab/opencollection.yml) in Bruno Desktop und wähle Environment **`public`** (ohne Docker gegen `petstore3.swagger.io`) oder **`local`** (mit eigenem Container aus [A00](../../advanced/A00-lokales-labor-docker.md)).
2. Sieh dir in `01-create-pet` die Tabs **Assert** (`res.status eq 200`), **Script → Post Response** (`bru.setVar("petId", String(res.body.id));`) und **Tests** an.
3. Klicke auf das **Runner-Symbol** (Collection/Folder *Run*) auf dem Ordner `pets` und starte alle 4 Requests hintereinander: `03-get-pet-by-id` verwendet automatisch `{{petId}}` aus Schritt 1!

### `SoapUI Open Source 5.10.1` (`Property Transfer` + `XPath Match` + `MockService` ohne Docker)

1. Öffne [order-service-soapui-project.xml](../../collections/soapui/order-service-soapui-project.xml) in SoapUI OS 5.10.1.
2. Starte zuerst den eingebauten **`OrderServiceMock`** im Projektbaum über den grünen Play-Button (Port `8088`) — damit laufen SoapUI-Tests komplett **ohne Docker-Container**! (Falls du das eigene Container-Labor aus [A00](../../advanced/A00-lokales-labor-docker.md) gestartet hast, läuft der echte Server unter Port `9000`.)
3. Klappe `OrderServiceTestSuite → OrderChainingTestCase` auf:
   - **Step 1 (`CreateOrder`)**: Legt Auftrag an und prüft mit **XPath Match** (`//tns:CreateOrderResponse/tns:status = CREATED`).
   - **Step 2 (`TransferOrderId`)**: *Property Transfer* kopiert die erzeugte `orderId` automatisch aus der Response in den nächsten Request.
   - **Step 3 (`GetOrder`)**: Ruft den Auftrag ab und prüft per **XPath Match** auf `CUST-CHAIN-01`.
4. Klicke im `OrderChainingTestCase` auf den grünen Play-Button, sodass alle 3 Steps automatisch grün durchlaufen.

> **Für Fortgeschrittene (CI-Ausführung per CLI):** Wie du diese Collections automatisiert über `bru run` auf der Shell startest, erklärt [Advanced A06](../../advanced/A06-token-lifecycle-bruno-cli-cicd.md).

## 4. Typische Fallstricke und Troubleshooting

| Fehlerbild | Ursache | Diagnose & Lösung |
| :--- | :--- | :--- |
| In `environments/local.yml` tauchen unerwartet IDs auf | Es wurde `bru.setEnvVar()` statt `bru.setVar()` verwendet | Auf `bru.setVar()` umstellen |
| XPath Match Assertion schlägt in SoapUI trotz vorhandenem Element fehl | XML-Namespace (`tns:`) wurde im XPath-Ausdruck nicht deklariert | Im XPath-Editor oben auf **Declare** klicken (`declare namespace tns='http://api-schulung.local/orders/v1';`) |
| Property Transfer kopiert leeren Wert | Falscher Property-Typ gewählt | Quelle auf `Response`, Ziel auf `Request` prüfen |

## 5. Spickzettel (Cheat Sheet)

| Werkzeug | Konstrukt | Beispiel |
| :--- | :--- | :--- |
| **Bruno** | Flüchtige Variable setzen/lesen | `bru.setVar("id", res.body.id)` / `{{id}}` |
| **Bruno** | Statuscode im Tests-Tab prüfen | `test("OK", () => expect(res.status).to.equal(200));` |
| **SoapUI** | XPath mit Namespace | `declare namespace tns='http://api-schulung.local/orders/v1'; //tns:status` |
| **SoapUI** | MockService Endpoint | `http://localhost:8088/mockOrderService` |

## 6. Querverweise

- **Übung:** [M04-uebung.md](../../02-uebungen/M04-uebung.md)
- **Musterlösung:** [M04-loesung.md](../../03-loesungen/M04-loesung.md)
- **Bruno Collection:** [petstore-lab](../../collections/bruno/petstore-lab/opencollection.yml)
- **SoapUI Projekt:** [order-service-soapui-project.xml](../../collections/soapui/order-service-soapui-project.xml)
