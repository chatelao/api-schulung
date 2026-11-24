---
module_id: M03
title: "SOAP 1.1/1.2 & WSDL-Verträge in SoapUI und curl"
level: "Stufe 1 - Grundlagen"
duration_minutes: 150
tools: ["SoapUI Open Source 5.10.1", "curl", "Bruno CLI (bru import wsdl)"]
standards: ["WSDL 1.1", "XML Schema (XSD)", "SOAP 1.1", "SOAP 1.2", "WS-I Basic Profile 1.1"]
lab_services: ["soap-service"]
prerequisites: ["M00", "M01"]
---

# Modul 3: SOAP 1.1/1.2 & WSDL-Verträge in SoapUI und `curl`

## 1. Lernziele

Nach Abschluss dieses Moduls kannst du:
1. Einen **WSDL-1.1-Vertrag** (`types`/XSD, `message`, `portType`, `binding`, `service`) systematisch lesen und auf konkrete XML-Requests abbilden.
2. Die Protokollunterschiede zwischen **SOAP 1.1** und **SOAP 1.2** (`Envelope`-Namespace, `Content-Type`, `SOAPAction`, `Fault`-Struktur) sicher **erklären** und im HTTP-Trace erkennen.
3. SOAP-Dienste in **SoapUI Open Source 5.10.1** importieren, über *WS-I Compliance* prüfen und valide Requests ausführen.
4. Identische SOAP-Anfragen bytegenau per `curl --data-binary @datei.xml` senden und gezielte XSD-Faults diagnostizieren.

## 2. Architektur und Kernkonzepte

Im Gegensatz zu ressourcenorientiertem REST/JSON ist SOAP ein streng typisiertes, nachrichtenorientiertes XML-Protokoll. Der Vertrag wird in **WSDL 1.1** beschrieben:
- `<wsdl:types>`: Eingebettete oder importierte **XSD-Schemas** (Datentypen, Pflichtfelder, Kardinalitäten).
- `<wsdl:message>`: Abstrakte Ein- und Ausgabenachrichten.
- `<wsdl:portType>`: Logische Operationen (`CreateOrder`, `GetOrder`, `CalculateTax`).
- `<wsdl:binding>`: Konkretes Transport-Protokoll (`document/literal`, `SOAPAction`).
- `<wsdl:service>`: Konkrete Netzwerk-Endpunkte (`<soap:address location="..."/>`).

### Vergleichstabelle: SOAP 1.1 vs. SOAP 1.2

| Kriterium | SOAP 1.1 | SOAP 1.2 (W3C) |
| :--- | :--- | :--- |
| **`Envelope`-Namespace** | `http://schemas.xmlsoap.org/soap/envelope/` | `http://www.w3.org/2003/05/soap-envelope` |
| **`Content-Type` Header** | `text/xml; charset=utf-8` | `application/soap+xml; charset=utf-8` |
| **`SOAPAction` HTTP-Header** | **Pflicht** (oft in Anführungszeichen, z. B. `"http://.../CreateOrder"`) | Entfällt; optional als `; action="..."` im `Content-Type` |
| **Fault-Elemente** | `<faultcode>` (`soap:Client`, `soap:Server`), `<faultstring>`, `<detail>` | `<soap:Code><soap:Value>` (`soap:Sender`, `soap:Receiver`), `<soap:Reason><soap:Text>`, `<soap:Detail>` |

### Warum `curl --data-binary` für XML/SOAP Pflicht ist

`curl -d @datei.xml` entfernt Zeilenumbrüche (`\n`, `\r`), was XML-Parser bei mehrzeiligen Elementen oder später bei **WS-Security-Signaturen** (Modul 8) sofort bricht. Verwende daher stets `--data-binary @datei.xml`.

## 3. Geführter Walkthrough (`SoapUI`, `curl`, Ausblick `Bruno`)

### `SoapUI Open Source 5.10.1`

1. Öffne SoapUI OS 5.10.1 (oder lade direkt das vorbereitete Projekt [order-service-soapui-project.xml](../../collections/soapui/order-service-soapui-project.xml)).
2. Für den Eigenimport: *File → New SOAP Project* → Project Name: `OrderService` → Initial WSDL: `http://localhost:9000/soap?wsdl`.
3. Inspiziere über Rechtsklick auf das Interface `OrderServiceSoap11Binding → Show Interface Viewer` die Tabs **Overview**, **Service Endpoints** und **WSDL Content**.
4. Führe im Interface Viewer den **WS-I Basic Profile 1.1 Compliance Check** aus (Symbol *Check WS-I Compliance*).
5. Öffne `CreateOrder → Request 1`, trage valide Werte (`customerId=CUST-01`, `itemCode=API-100`, `quantity=3`, `netAmount=49.50`) ein, sende den Request ab und wechsle anschliessend in den **Raw-Tab**, um HTTP-Header (`Content-Type`, `SOAPAction`) und Body zu prüfen.

### `curl` (`--data-binary`)

```bash
# 1. WSDL abrufen
curl -sS "http://localhost:9000/soap?wsdl" | head -n 20

# 2. Valider SOAP 1.1 Request (CreateOrder)
curl -i -X POST "http://localhost:9000/soap" \
  -H "Content-Type: text/xml; charset=utf-8" \
  -H "SOAPAction: \"http://api-schulung.local/orders/v1/CreateOrder\"" \
  --data-binary @01-module/M03-soap-wsdl-soapui-curl/beispiel-payloads/create-order-soap11.xml

# 3. Valider SOAP 1.2 Request (CalculateTax)
curl -i -X POST "http://localhost:9000/soap" \
  -H "Content-Type: application/soap+xml; charset=utf-8" \
  --data-binary @01-module/M03-soap-wsdl-soapui-curl/beispiel-payloads/create-order-soap12.xml

# 4. Gezielter XSD-Typfehler (quantity="abc" -> soap:Client Fault)
curl -i -X POST "http://localhost:9000/soap" \
  -H "Content-Type: text/xml; charset=utf-8" \
  -H "SOAPAction: \"http://api-schulung.local/orders/v1/CreateOrder\"" \
  --data-binary @01-module/M03-soap-wsdl-soapui-curl/beispiel-payloads/invalid-xsd-fault.xml
```

### Ausblick: WSDL-Import in Bruno (`bru import wsdl`)

Bruno unterstützt den Import von WSDL-Dateien über die CLI (`bru import wsdl --source http://localhost:9000/soap?wsdl --output /tmp/soap-bruno`). Für reine XML-Smoke-Tests ist das praktisch; sobald jedoch **WSDL-Schema-Validierung**, **WS-I-Prüfungen**, **XPath-Property-Transfers** oder **WS-Security-Keystores** erforderlich sind, bleibt **SoapUI Open Source** das überlegene Werkzeug.

## 4. Typische Fallstricke und Troubleshooting

| Fehlerbild | Ursache | Diagnose & Lösung |
| :--- | :--- | :--- |
| Server meldet `soap:Client`: *«SOAP 1.1 erfordert SOAPAction»* | `SOAPAction`-Header fehlt beim `curl`-Aufruf oder in Bruno | Header `-H 'SOAPAction: "..."'` aus `<soap:operation soapAction="..."/>` der WSDL übernehmen |
| Server meldet `Content-Type passt nicht zum Envelope-Namespace` | SOAP-1.2-Namespace (`2003/05/soap-envelope`) wurde mit `text/xml` gesendet (oder umgekehrt) | SOAP 1.1 ↔ `text/xml`; SOAP 1.2 ↔ `application/soap+xml` strikt paaren |
| XSD-Validierungsfehler trotz scheinbar korrekter Elemente | Falsche Elementreihenfolge in `<xsd:sequence>` oder fehlender `tns:`-Namespace (`elementFormDefault="qualified"`) | Namespace `xmlns:tns="http://api-schulung.local/orders/v1"` und exakte Reihenfolge aus WSDL prüfen |
| SoapUI zeigt `UnknownHostException` beim WSDL-Import | Falscher Port oder Container `soap-service` läuft nicht | `curl -i http://localhost:9000/soap?wsdl` im Terminal testen |

## 5. Spickzettel (Cheat Sheet)

| Element / Flag | Bedeutung |
| :--- | :--- |
| `GET http://localhost:9000/soap?wsdl` | Lädt den WSDL-1.1-Vertrag des lokalen SOAP-Services |
| `Content-Type: text/xml; charset=utf-8` | Pflicht-Medientyp für SOAP 1.1 |
| `Content-Type: application/soap+xml; charset=utf-8` | Pflicht-Medientyp für SOAP 1.2 |
| `curl --data-binary @req.xml` | Verhindert Zeilenumbruch-Verlust beim XML-Versand |
| `<soap:Client>` / `<soap:Sender>` | Client-/Sender-seitiger Eingabe- oder Schemafehler (HTTP `500`) |

## 6. Querverweise

- **Übung:** [M03-uebung.md](../../02-uebungen/M03-uebung.md)
- **Musterlösung:** [M03-loesung.md](../../03-loesungen/M03-loesung.md)
- **SoapUI-Projekt:** [order-service-soapui-project.xml](../../collections/soapui/order-service-soapui-project.xml)
- **curl-Skript:** [m03-soap-call.sh](../../scripts/curl/m03-soap-call.sh)
