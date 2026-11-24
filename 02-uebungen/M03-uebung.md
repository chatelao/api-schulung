---
module_id: M03
title: "SOAP 1.1/1.2 & WSDL-Verträge in SoapUI und curl"
level: "Stufe 1 - Grundlagen"
duration_minutes: 150
tools: ["SoapUI Open Source 5.10.1", "curl", "Bruno CLI"]
standards: ["WSDL 1.1", "XSD", "SOAP 1.1", "SOAP 1.2", "WS-I Basic Profile 1.1"]
lab_services: ["soap-service"]
prerequisites: ["M00", "M01"]
---

# Übung M03: SOAP 1.1/1.2 & WSDL-Verträge in SoapUI und `curl`

## 1. Szenario und Zielzustand

Ein Kern-ERP-System stellt eine Auftrags- und Steuerberechnungsschnittstelle als SOAP-Webservice (`http://localhost:9000/soap?wsdl`) bereit. Du sollst den WSDL-Vertrag in SoapUI Open Source 5.10.1 prüfen, identische Aufrufe über `curl --data-binary` reproduzieren und SOAP-1.1- gegen SOAP-1.2-Faults abgrenzen.

## 2. Aufgabenpakete

### Aufgabe A: WSDL-Analyse & WS-I Check in SoapUI OS 5.10.1
1. Erstelle in SoapUI ein neues SOAP-Projekt aus `http://localhost:9000/soap?wsdl` (Alternativ-Fallback bei fehlendem Docker: `https://demo.totalshiftleft.ai/soap?wsdl`).
2. Prüfe im *Interface Viewer* die Tabs `Service Endpoints` und `WSDL Content` und führe den **WS-I Compliance Check** aus.
3. Sende einen gültigen `CalculateTax`-Request (`netAmount: 200.00`, `countryCode: CH`) und prüfe im **Raw-Tab** den exakten `Content-Type` und `SOAPAction`-Header.

### Aufgabe B: Bytegenauer Versand per `curl --data-binary`
1. Sende [create-order-soap11.xml](../01-module/M03-soap-wsdl-soapui-curl/beispiel-payloads/create-order-soap11.xml) per `curl --data-binary` gegen `http://localhost:9000/soap`.
2. Sende [create-order-soap12.xml](../01-module/M03-soap-wsdl-soapui-curl/beispiel-payloads/create-order-soap12.xml) als **SOAP 1.2** (`application/soap+xml`) und vergleiche die Antwort-Header.

### Aufgabe C: SOAP-Fault-Diagnose (1.1 vs. 1.2)
1. Provoziere mit [invalid-xsd-fault.xml](../01-module/M03-soap-wsdl-soapui-curl/beispiel-payloads/invalid-xsd-fault.xml) einen XSD-Typfehler und dokumentiere die Fault-Elemente (`faultcode`, `faultstring`).
2. Sende denselben Request versehentlich **ohne** `SOAPAction`-Header und beobachte die Server-Antwort.
3. Teste einen SOAP-1.2-Fault (z. B. `GetOrderRequest` für eine unbekannte ID `ORD-9999` mit `Content-Type: application/soap+xml`) und identifiziere `<soap:Code>` und `<soap:Reason>`.

### Bonus-Challenge D: WSDL-Import in Bruno bewerten
Führe `bru import wsdl --source http://localhost:9000/soap?wsdl --output /tmp/soap-bruno-check` aus und vergleiche in 3 Stichpunkten, was Bruno importiert und warum SoapUI für komplexe XML-/WSS-Verträge im Vorteil bleibt.

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Warum schlägt ein SOAP-1.1-Aufruf ohne SOAPAction fehl?</summary>

SOAP 1.1 trennt Transport-Routing (`SOAPAction`-HTTP-Header) vom XML-Body. Ohne `SOAPAction`-Header wissen Firewalls, Gateways und strenge SOAP-1.1-Server nicht, welche Operation gemeint ist.

</details>

<details>
<summary>Tipp 2 (Konkret): curl-Kommandos für Aufgabe B & C</summary>

```bash
# SOAP 1.1 CreateOrder
curl -i -X POST http://localhost:9000/soap \
  -H 'Content-Type: text/xml; charset=utf-8' \
  -H 'SOAPAction: "http://api-schulung.local/orders/v1/CreateOrder"' \
  --data-binary @01-module/M03-soap-wsdl-soapui-curl/beispiel-payloads/create-order-soap11.xml

# SOAP 1.2 CalculateTax
curl -i -X POST http://localhost:9000/soap \
  -H 'Content-Type: application/soap+xml; charset=utf-8' \
  --data-binary @01-module/M03-soap-wsdl-soapui-curl/beispiel-payloads/create-order-soap12.xml
```

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] WSDL wurde in SoapUI OS 5.10.1 importiert und per WS-I Compliance geprüft.
- [ ] `CreateOrder` und `CalculateTax` liefern sowohl in SoapUI als auch über `curl --data-binary` HTTP `200 OK`.
- [ ] Der XSD-Typfehler liefert einen HTTP `500` mit `<faultcode>soap:Client</faultcode>` (SOAP 1.1) bzw. `<soap:Value>soap:Sender</soap:Value>` (SOAP 1.2).
- [ ] Das Skript [scripts/curl/m03-soap-call.sh](../scripts/curl/m03-soap-call.sh) läuft fehlerfrei durch.
