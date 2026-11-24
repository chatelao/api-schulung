# Musterlösung M03: SOAP 1.1/1.2 & WSDL-Verträge

## Lösung Aufgabe A: SoapUI OS 5.10.1
- Nach Import von `http://localhost:9000/soap?wsdl` zeigt der **Raw-Tab** von `CalculateTax`:
  - `Content-Type: text/xml;charset=UTF-8`
  - `SOAPAction: "http://api-schulung.local/orders/v1/CalculateTax"`
- Ergebnis für `netAmount=200.00`, `countryCode=CH`: `taxRate=0.081`, `taxAmount=16.20`, `grossAmount=216.20`.

## Lösung Aufgabe B & C: `curl --data-binary` & Fault-Analyse

Siehe ausführbares Referenzskript: [scripts/curl/m03-soap-call.sh](../../scripts/curl/m03-soap-call.sh).

### Diagnose der provozierten Faults
1. **XSD-Typfehler (`quantity="NICHT_GUELTIG"`):** HTTP `500`, `<faultcode>soap:Client</faultcode>`, `<faultstring>XSD-Validierungsfehler: ...</faultstring>`.
2. **Fehlender `SOAPAction`-Header bei SOAP 1.1:** HTTP `500`, `<faultcode>soap:Client</faultcode>`, `<faultstring>SOAP 1.1 erfordert den HTTP-Header SOAPAction.</faultstring>`.
3. **SOAP-1.2-Fault (`application/soap+xml`):** HTTP `500`, `<soap:Code><soap:Value>soap:Sender</soap:Value></soap:Code>`, `<soap:Reason><soap:Text xml:lang="de">...</soap:Text></soap:Reason>`.

## Lösung Bonus-Challenge D: Bruno `bru import wsdl`
- Bruno erzeugt eine OpenCollection-YAML-Collection mit `POST`-Requests und XML-Body-Templates.
- **Unterschied zu SoapUI OS 5.10.1:** Bruno bietet keine integrierte XSD-Schema-Validierung, keinen WS-I-Basic-Profile-Report und keinen nativen Keystore-/WS-Security-Wizard (`UsernameToken`, `Timestamp`, XML-Signatur).
