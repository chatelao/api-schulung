---
module_id: M08
title: "SOAP WS-Security (WSS): UsernameToken, Signatur & Verschlüsselung"
level: "Stufe 2 - Sicherheit"
duration_minutes: 120
tools: ["SoapUI Open Source 5.10.1", "curl", "python3"]
standards: ["OASIS WS-Security 1.1", "UsernameToken Profile", "XML Signature"]
lab_services: ["soap-service"]
prerequisites: ["M03", "M04", "M07"]
---

# Übung M08: SOAP WS-Security (WSS) in SoapUI Open Source

## 1. Szenario und Zielzustand

Der Abrechnungs-Endpunkt `http://localhost:9000/soap/secure` (`CreateSecureOrder`) akzeptiert Aufträge nur, wenn sie auf Nachrichtenebene über **WS-Security** abgesichert sind (`wsu:Timestamp`, `wsse:UsernameToken` und XML-Signatur `<ds:Signature>`). Du sollst den Sicherheitsaufbau schrittweise nachvollziehen — vom erwarteten Fehler ohne Header über `Timestamp + UsernameToken` bis zur signierten Nachricht inklusive Manipulations-Negativtest.

## 2. Aufgabenpakete

### Aufgabe A: Ungesicherter Negativtest gegen `/soap/secure`
Sende in SoapUI (ohne ausgewähltes Outgoing-WSS-Profil) einen `CreateSecureOrder`-Request gegen `http://localhost:9000/soap/secure` und dokumentiere den zurückgegebenen `wsse:FailedAuthentication`-Fault.

### Aufgabe B: 7-Schritte-WSS-Konfiguration in SoapUI OS 5.10.1
1. Öffne [collections/soapui/order-service-wss-soapui-project.xml](../collections/soapui/order-service-wss-soapui-project.xml) in SoapUI OS 5.10.1.
2. Prüfe im Tab *WS-Security Configurations → Keystores*, dass `client-keystore.jks` (`Status: OK`) geladen ist.
3. Prüfe die Outgoing-Konfiguration `LabOutgoingWSS` (`Timestamp` → `Username` mit `Nonce` + `Created` + `PasswordDigest` → `Signature` auf `Body`).
4. Führe `SecureOrderTestSuite → SecureOrderTestCase` aus und inspiziere im **Raw-Tab** den erzeugten `<wsse:Security>`-Block sowie in der Antwort `<tns:signatureVerified>true</tns:signatureVerified>`.

### Aufgabe C: Integritäts-Negativtest (1-Zeichen-Manipulation)
1. Wende die Outgoing-WSS-Konfiguration einmal statisch auf den Request an (Rechtsklick im XML-Editor → *Outgoing WSS → Apply "LabOutgoingWSS"*).
2. Ändere im bereits signierten `<soap:Body>` einen einzigen Buchstaben (z. B. `CUST-42` → `CUST-43`), sende die Nachricht **ohne** erneute Signierung ab und verifiziere den erwarteten `wsse:FailedCheck`-Signaturfehler.

### Bonus-Challenge D: `PasswordText` vs. `PasswordDigest` im Raw-Tab vergleichen
Lege eine zweite Outgoing-WSS-Konfiguration mit `Password Type: PasswordText` an und vergleiche im **Raw-Tab**, wie sich das `<wsse:Password>`-Element und der `<wsse:Nonce>`-Block gegenüber `PasswordDigest` unterscheiden.

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Worauf prüft der Server bei PasswordDigest und XML-Signatur?</summary>

Beim `PasswordDigest` berechnet der Server `Base64(SHA1(raw_nonce_bytes + created_utf8 + password_utf8))` und vergleicht ihn mit `<wsse:Password>`. Bei der XML-Signatur prüft `signxml` die Referenz-URI (`#id-...`) auf `<soap:Body>` gegen den öffentlichen Schlüssel in `lab/certs/out/client.crt`.

</details>

<details>
<summary>Tipp 2 (Konkret): Reihenfolge der Parts-Tabelle in SoapUI Signature</summary>

In SoapUI unter *Outgoing WS-Security Configurations → Signature → Parts* folgenden Eintrag setzen:
- **Name:** `Body`
- **Namespace:** `http://schemas.xmlsoap.org/soap/envelope/`
- **Encode:** `Element` (oder `Content`)

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] Ungesicherter Aufruf auf `/soap/secure` wird mit `wsse:FailedAuthentication` abgelehnt.
- [ ] `client-keystore.jks` zeigt in SoapUI den Status `OK`.
- [ ] `CreateSecureOrder` liefert mit `LabOutgoingWSS` HTTP `200 OK` und `<tns:signatureVerified>true</tns:signatureVerified>`.
- [ ] Eine 1-Zeichen-Manipulation am signierten `<soap:Body>` führt nachweisbar zu `wsse:FailedCheck`.
