---
module_id: M04
title: "Assertions, Request-Chaining, Scripting & Mocking"
level: "Stufe 1 - Grundlagen"
duration_minutes: 120
tools: ["Bruno (OpenCollection YAML)", "Bruno CLI (bru)", "SoapUI Open Source 5.10.1"]
standards: ["OpenCollection YAML 1.0.0", "Chai Assertions", "XPath", "Groovy"]
lab_services: ["petstore3", "soap-service"]
prerequisites: ["M02", "M03"]
---

# Übung M04: Assertions, Request-Chaining, Scripting & Mocking

## 1. Szenario und Zielzustand

Manuelle Klick-Tests skalieren nicht in CI/CD-Pipelines. Du sollst sowohl für die REST-API (`petstore3`) als auch für den SOAP-Service (`soap-service`) eine **vollautomatische End-to-End-Testkette ohne manuelles Kopieren von IDs** aufbauen und zusätzlich einen lokalen SOAP-MockService für Offline-Tests einrichten.

## 2. Aufgabenpakete

### Aufgabe A: Bruno-Workflow mit Assertions & Chaining
1. Öffne [collections/bruno/petstore-lab/](../collections/bruno/petstore-lab/opencollection.yml).
2. Ergänze im Request `03-get-pet-by-id.yml` eine zweite deklarative Assertion (`runtime.assertions`), die prüft, dass `res.body.status` gleich `available` ist.
3. Führe die gesamte Kette (`01-create-pet` → `02-find-by-status` → `03-get-pet-by-id` → `04-delete-pet`) über `bru run -r --env local` aus und verifiziere, dass `git status` **keine** unerwünschte Änderung in `environments/local.yml` meldet (`bru.setVar()` statt `bru.setEnvVar()`).

### Aufgabe B: SoapUI OS 5.10.1 TestCase mit `Property Transfer` & `XPath Match`
1. Öffne [collections/soapui/order-service-soapui-project.xml](../collections/soapui/order-service-soapui-project.xml) in SoapUI Open Source 5.10.1.
2. Starte `OrderServiceTestSuite → OrderChainingTestCase` und verifiziere, dass `CreateOrder` → `TransferOrderId` → `GetOrder` grün durchlaufen.
3. Füge im `GetOrder`-Step eine zusätzliche **XPath Match** Assertion hinzu, die prüft, dass `//tns:GetOrderResponse/tns:customerId` dem erwarteten Kunden entspricht.

### Aufgabe C: Lokalen SOAP MockService starten
1. Starte in `order-service-soapui-project.xml` den enthaltenen `OrderServiceMock` (Port `8088`) bzw. erstelle einen Mock für `CalculateTax`, der unabhängig vom Docker-Container feste Steuerwerte (`taxRate=0.081`) zurückgibt.
2. Sende per `curl --data-binary` einen `CalculateTax`-Request direkt gegen den SoapUI-MockService (`http://localhost:8088/mockOrderService`).

### Bonus-Challenge D: Data-Driven CSV-Lauf in Bruno CLI
Erstelle eine kleine CSV-Datei `/tmp/pets.csv` (`petId,petName`) mit zwei Zeilen und führe einen parametrischen Bruno-Lauf mit `bru run --csv-file-path /tmp/pets.csv` aus (Hinweis: Dokumentiere dabei auch, warum dieselbe Funktion in SoapUI Open Source ein Groovy-Skript statt der ReadyAPI-DataSource benötigt).

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Wie vermeidet man fehlgeschlagene XPath-Assertions in SoapUI?</summary>

Die Elemente in `order-service.wsdl` liegen im Target-Namespace `http://api-schulung.local/orders/v1`. Ein XPath-Ausdruck wie `//orderId` findet daher nichts — der Namespace muss per `declare namespace tns='http://api-schulung.local/orders/v1'; //tns:orderId` gebunden sein.

</details>

<details>
<summary>Tipp 2 (Konkret): Konkrete YAML-Assertion und CSV-Format für Bonus D</summary>

```yaml
# Zusaetzliche Assertion in 03-get-pet-by-id.yml:
runtime:
  assertions:
    - expression: res.status
      operator: eq
      value: "200"
    - expression: res.body.status
      operator: eq
      value: available
```

```csv
petId,petName
5001,Rex
5002,Milo
```

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] `bru run -r --env local` läuft in `collections/bruno/petstore-lab` komplett grün (Exit-Code `0`).
- [ ] `git diff environments/` bleibt nach dem Bruno-Testlauf leer (`bru.setVar()` genutzt).
- [ ] In SoapUI OS 5.10.1 läuft `OrderChainingTestCase` (`CreateOrder` → `Property Transfer` → `GetOrder`) grün durch.
- [ ] Der SOAP-MockService beantwortet einen `curl`-Request auf Port `8088` mit validem SOAP-XML.
