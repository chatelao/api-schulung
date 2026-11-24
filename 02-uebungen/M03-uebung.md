---
module_id: M03
title: "SOAP 1.1/1.2 & WSDL-Verträge in SoapUI Open Source"
level: "Stufe 1 - Grundlagen"
duration_minutes: 150
tools: ["SoapUI Open Source 5.10.1", "Bruno Desktop"]
standards: ["WSDL 1.1", "XSD", "SOAP 1.1", "SOAP 1.2", "WS-I Basic Profile 1.1"]
lab_services: ["soap-service"]
prerequisites: ["M00", "M01"]
---

# Übung M03: SOAP 1.1/1.2 & WSDL-Verträge in SoapUI Open Source

## 1. Szenario und Zielzustand

Ein Kern-ERP-System stellt eine Auftrags- und Steuerberechnungsschnittstelle als SOAP-Webservice (`http://localhost:9000/soap?wsdl`) bereit. Du importierst den WSDL-Vertrag in **SoapUI Open Source 5.10.1**, prüfst seine Standardkonformität, analysierst gültige Antworten sowie gezielte SOAP-Faults im Raw-Tab und lernst den Unterschied zwischen SOAP 1.1 und SOAP 1.2 kennen.

## 2. Aufgabenpakete

### Aufgabe A: WSDL-Analyse & WS-I Check in SoapUI OS 5.10.1
1. Erstelle in SoapUI ein neues SOAP-Projekt aus `http://localhost:9000/soap?wsdl` (Alternativ-Fallback ohne Docker: `https://demo.totalshiftleft.ai/soap?wsdl`).
2. Öffne den *Interface Viewer* (`OrderServiceSoap11Binding`), prüfe die Tabs `Service Endpoints` und `WSDL Content` und führe den **WS-I Compliance Check** aus.
3. Sende einen gültigen `CalculateTax`-Request (`netAmount: 200.00`, `countryCode: CH`) und prüfe im **Raw-Tab** den exakten `Content-Type` und den `SOAPAction`-Header.

### Aufgabe B: `CreateOrder` und `GetOrder` im SoapUI-Editor ausführen
1. Sende eine gültige `CreateOrder`-Anfrage (`customerId: CUST-01`, `itemCode: API-COURSE-01`, `quantity: 3`, `netAmount: 49.50`) und notiere die zurückgegebene `orderId`.
2. Rufe genau diese `orderId` anschliessend über die Operation `GetOrder` wieder ab.

### Aufgabe C: SOAP-Fault-Diagnose (1.1 vs. 1.2)
1. Ändere im `CreateOrder`-Request das Feld `<v1:quantity>` auf `NICHT_GUELTIG` und sende ihn ab. Notiere `<faultcode>` und `<faultstring>`.
2. Teste in **Bruno Desktop** einen manuellen `POST`-Request gegen `http://localhost:9000/soap` mit dem Inhalt von [create-order-soap12.xml](../01-module/M03-soap-wsdl-soapui-curl/beispiel-payloads/create-order-soap12.xml) und dem Header `Content-Type: application/soap+xml; charset=utf-8`. Provoziere anschliessend mit `GetOrderRequest` (`ORD-9999`) einen SOAP-1.2-Fault (`<soap:Code>` / `<soap:Reason>`).

### Bonus-Challenge D: `SOAPAction`-Pflicht bei SOAP 1.1 testen
Sende in Bruno Desktop den Inhalt von [create-order-soap11.xml](../01-module/M03-soap-wsdl-soapui-curl/beispiel-payloads/create-order-soap11.xml) mit `Content-Type: text/xml; charset=utf-8` einmal **ohne** `SOAPAction`-Header und einmal **mit** `SOAPAction: "http://api-schulung.local/orders/v1/CreateOrder"`.

> **Hinweis:** Die Shell-/Terminal-Übungen mit `curl --data-binary` findest du in [Advanced A02](../advanced/A02-soap-curl-databinary.md).

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Warum braucht SOAP 1.1 den Header SOAPAction?</summary>

SOAP 1.1 trennt Transport-Routing (`SOAPAction`-HTTP-Header) vom XML-Inhalt. Ohne `SOAPAction`-Header wissen Gateways und strenge SOAP-1.1-Server nicht, welche Operation im Body gemeint ist.

</details>

<details>
<summary>Tipp 2 (Konkret): Schema-Validierung direkt im SoapUI-Editor</summary>

Drücke im XML-Request-Editor von SoapUI einfach **`Alt+V`** (oder Rechtsklick → *Validate*), um einen XSD-Typfehler schon *vor* dem Absenden rot markiert zu sehen!

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] WSDL wurde in SoapUI OS 5.10.1 importiert und per WS-I Compliance geprüft.
- [ ] `CalculateTax`, `CreateOrder` und `GetOrder` liefern `200 OK` mit validen XML-Antworten.
- [ ] Der XSD-Typfehler liefert einen SOAP-1.1-Fault (`<faultcode>soap:Client</faultcode>`).
- [ ] Der Unterschied zwischen `text/xml` + `SOAPAction` (SOAP 1.1) und `application/soap+xml` (SOAP 1.2) ist im Raw-Tab/Header sichtbar geworden.
