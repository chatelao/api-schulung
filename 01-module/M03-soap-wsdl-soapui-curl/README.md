---
module_id: M03
title: "SOAP 1.1/1.2 & WSDL-Verträge in SoapUI Open Source"
level: "Stufe 1 - Grundlagen"
duration_minutes: 150
tools: ["SoapUI Open Source 5.10.1", "Webbrowser", "Bruno Desktop (XML-Ansicht)"]
standards: ["WSDL 1.1", "XML Schema (XSD)", "SOAP 1.1", "SOAP 1.2", "WS-I Basic Profile 1.1"]
lab_services: ["public (CountryInfoService.wso?WSDL)", "optional A00: soap-service"]
prerequisites: ["M00", "M01"]
---

# Modul 3: SOAP 1.1/1.2 & WSDL-Verträge in SoapUI Open Source

## 1. Lernziele

Nach Abschluss dieses Moduls kannst du:
1. Einen **WSDL-1.1-Vertrag** (`types`/XSD, `message`, `portType`, `binding`, `service`) anschaulich **lesen** und auf konkrete XML-Requests abbilden.
2. Die Protokollunterschiede zwischen **SOAP 1.1** und **SOAP 1.2** (`Envelope`-Namespace, `Content-Type`, `SOAPAction`, `Fault`-Struktur) sicher **erklären**.
3. Öffentliche und lokale SOAP-Dienste in **SoapUI Open Source 5.10.1** importieren, über *WS-I Compliance* prüfen und valide Requests ausführen.
4. Fehlerhafte XML-Anfragen (**SOAP Faults**) strukturiert über den **Raw-Tab** von SoapUI **diagnostizieren**.

## 2. Architektur und Kernkonzepte (ohne Netzwerk-Vorwissen)

Während moderne REST-APIs meist kurze JSON-Texte austauschen, nutzen klassische Unternehmenssysteme (Banken, Versicherungen, ERP) häufig **SOAP** (*Simple Object Access Protocol*). Jede SOAP-Nachricht ist wie ein **normierter Geschäftsbrief im XML-Umschlag** aufgebaut:
- **`<soap:Envelope>`:** Der äussere Briefumschlag.
- **`<soap:Header>` (optional):** Zusatzinformationen wie Zeitstempel oder Anmeldedaten.
- **`<soap:Body>`:** Der eigentliche Auftrag (z. B. `CapitalCity` oder `CreateOrderRequest`).
- **`<soap:Fault>`:** Eine standardisierte Fehlermeldung im Body, falls Daten ungültig waren.

Der **WSDL-Vertrag** (z. B. öffentlich unter `http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL`) ist das Gegenstück zu OpenAPI bei REST: Er legt exakt fest, welche Operationen existieren und welche Datentypen (`xsd:string`, `xsd:positiveInteger`, `xsd:decimal`) erlaubt sind.

### Vergleichstabelle: SOAP 1.1 vs. SOAP 1.2

| Kriterium | SOAP 1.1 | SOAP 1.2 (W3C) |
| :--- | :--- | :--- |
| **`Envelope`-Namespace** | `http://schemas.xmlsoap.org/soap/envelope/` | `http://www.w3.org/2003/05/soap-envelope` |
| **`Content-Type` Header** | `text/xml; charset=utf-8` | `application/soap+xml; charset=utf-8` |
| **`SOAPAction` HTTP-Header** | **Pflicht** (z. B. `"http://.../CreateOrder"`) | Entfällt; optional direkt im `Content-Type` |
| **Fault-Elemente** | `<faultcode>` (`soap:Client`, `soap:Server`), `<faultstring>` | `<soap:Code><soap:Value>` (`soap:Sender`, `soap:Receiver`), `<soap:Reason>` |

## 3. Geführter Walkthrough (`SoapUI Open Source 5.10.1` — ohne Docker startklar!)

### Schritt 1: Öffentlichen WSDL-Dienst importieren (`CountryInfoService`)

1. Öffne **SoapUI Open Source 5.10.1** → **File → New SOAP Project**.
2. Gib als **Initial WSDL** den öffentlichen Dienst **`http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL`** ein → **OK**.
3. Du siehst sofort zwei Bindings: **`CountryInfoServiceSoapBinding` (SOAP 1.1)** und **`CountryInfoServiceSoapBinding12` (SOAP 1.2)**!
4. Rechtsklick auf `CountryInfoServiceSoapBinding` → **Show Interface Viewer**: Sieh dir **Overview**, **Service Endpoints** und **WSDL Content** an und klicke auf **Check WS-I Compliance**.
5. Öffne unter `CountryInfoServiceSoapBinding` → `CapitalCity` → `Request 1`, trage `<web:sCountryISOCode>CH</web:sCountryISOCode>` ein und klicke den grünen **Play-Button** → Antwort: `Bern`.
6. Wechsle im Request-Fenster auf den **Raw-Tab** (`text/xml` + `SOAPAction`) und vergleiche ihn anschliessend mit derselben Operation unter `CountryInfoServiceSoapBinding12` (`application/soap+xml`).

### Schritt 2 (Optional mit eigenem Container-Labor `A00`): Eigener `OrderService` (`http://localhost:9000/soap?wsdl`)

Für kontrollierte **XSD-Validierungs-Faults** und die lokale Auftrags-Logik nutzt du unser Kurs-Projekt [order-service-soapui-project.xml](../../collections/soapui/order-service-soapui-project.xml) gegen das lokale Container-Labor ([Advanced A00](../../advanced/A00-lokales-labor-docker.md)).

### Ausblick: XML-Requests in `Bruno Desktop`

Auch Bruno Desktop kann XML-Bodies versenden (Body-Typ **XML**). Sobald jedoch automatische WSDL-Formulare, WS-I-Konformitätsprüfungen oder komplexe WS-Security-Signaturen gefragt sind, bleibt **SoapUI Open Source** das Spezialwerkzeug.

> **Für Fortgeschrittene (Shell & `curl`):** Die bytegenaue Übertragung von XML-Dateien mit `curl --data-binary` findest du in [Advanced A02: SOAP mit curl](../../advanced/A02-soap-curl-databinary.md).

## 4. Typische Fallstricke und Troubleshooting

| Fehlerbild | Ursache | Diagnose & Lösung in SoapUI |
| :--- | :--- | :--- |
| Server meldet `soap:Client`: *«SOAP 1.1 erfordert SOAPAction»* | `SOAPAction`-Header fehlt (z. B. bei manuellem Kopieren in Bruno) | Header `SOAPAction` aus der WSDL (`<soap:operation soapAction="..."/>`) ergänzen |
| Server meldet `Content-Type passt nicht zum Envelope-Namespace` | SOAP-1.2-Namespace (`2003/05/soap-envelope`) wurde mit `text/xml` gesendet | SOAP 1.1 ↔ `text/xml`; SOAP 1.2 ↔ `application/soap+xml` paaren |
| XSD-Validierungsfehler trotz scheinbar richtiger Felder | Falsche Elementreihenfolge oder fehlendes Namespace-Präfix | Mit **`Alt+V`** (oder Rechtsklick → *Validate*) direkt in SoapUI gegen XSD prüfen |
| Öffentlicher WSDL nicht erreichbar oder Offline-Umgebung | Keine Internetverbindung / Firewall | Lokales Container-Labor (`soap-service` auf `http://localhost:9000/soap?wsdl`) gemäss [Advanced A00](../../advanced/A00-lokales-labor-docker.md) starten |

## 5. Spickzettel (Cheat Sheet)

| Begriff / Element | Bedeutung |
| :--- | :--- |
| `http://webservices.oorsprong.org/.../CountryInfoService.wso?WSDL` | Öffentlicher SOAP-1.1/1.2-WSDL-Testdienst (ohne Docker) |
| `Content-Type: text/xml; charset=utf-8` | Pflicht-Medientyp für SOAP 1.1 |
| `Content-Type: application/soap+xml; charset=utf-8` | Pflicht-Medientyp für SOAP 1.2 |
| **Raw-Tab** (SoapUI) | Zeigt exakt die gesendeten HTTP-Header inklusive `SOAPAction` |
| `<soap:Client>` / `<soap:Sender>` | Eingabe- oder Schemafehler auf Client-Seite |

## 6. Querverweise

- **Übung:** [M03-uebung.md](../../02-uebungen/M03-uebung.md)
- **Musterlösung:** [M03-loesung.md](../../03-loesungen/M03-loesung.md)
- **SoapUI-Projekt (lokal):** [order-service-soapui-project.xml](../../collections/soapui/order-service-soapui-project.xml)
- **Advanced (Docker & `curl`):** [A00-lokales-labor-docker.md](../../advanced/A00-lokales-labor-docker.md) & [A02-soap-curl-databinary.md](../../advanced/A02-soap-curl-databinary.md)
