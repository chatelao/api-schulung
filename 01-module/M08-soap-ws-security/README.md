---
module_id: M08
title: "SOAP WS-Security (WSS): UsernameToken, Signatur & Verschlüsselung"
level: "Stufe 2 - Sicherheit"
duration_minutes: 120
tools: ["SoapUI Open Source 5.10.1"]
standards: ["OASIS WS-Security 1.1", "UsernameToken Profile", "XML Signature", "XML Encryption"]
lab_services: ["soap-service"]
prerequisites: ["M03", "M04", "M07"]
---

# Modul 8: SOAP WS-Security (WSS) in SoapUI Open Source

## 1. Lernziele

Nach Abschluss dieses Moduls kannst du:
1. **Nachrichtenbasierte Sicherheit (Message-Level Security)** im `<soap:Header>` von reiner Transportsicherheit (**TLS/mTLS**) fundiert **abgrenzen**.
2. Den **Sieben-Schritte-Workflow** in **SoapUI Open Source 5.10.1** (Keystores, Truststores, Outgoing WSS, Incoming WSS, WSS Status Assertion) fehlerfrei **konfigurieren**.
3. `wsu:Timestamp`, `wsse:UsernameToken` (inkl. `Nonce`, `Created` und `PasswordDigest`) sowie **XML-Signatur** (`ds:Signature`) im `<soap:Header>` analysieren.
4. Fehlerbilder wie falsche Outgoing-WSS-Reihenfolge, Clock Skew oder manipulierte XML-Bodies im **WSS Inspector** und **Raw-Tab** **diagnostizieren**.

## 2. Architektur und Kernkonzepte

TLS/mTLS schützt die Verbindung immer nur **Punkt-zu-Punkt** bis zum nächsten TLS-Terminator (z. B. Load Balancer, API-Gateway oder ESB). Sobald eine SOAP-Nachricht über mehrere Intermediäre weitergereicht oder asynchron zwischengespeichert wird, endet der TLS-Schutz. **WS-Security (WSS)** bettet Authentifizierung, Integrität (Signatur) und Vertraulichkeit (Verschlüsselung) direkt in den `<soap:Header>` der Nachricht ein — unabhängig vom Transportweg.

### Vergleichstabelle: Transportsicherheit (TLS/mTLS) vs. WS-Security (Message-Level)

| Kriterium | TLS / mTLS (Transportebene) | WS-Security (Nachrichtenebene) |
| :--- | :--- | :--- |
| **Schutzbereich** | Punkt-zu-Punkt (Hop-by-Hop) | **Ende-zu-Ende** über Intermediäre/ESBs hinweg |
| **Granularität** | Gesamter TCP-/HTTP-Stream | Selektiv pro XML-Element (`Body`, `Timestamp`, Teile des Headers) |
| **Replay-Schutz** | TLS-Session-Ebene | `<wsu:Timestamp>` (`Created`/`Expires`) + `<wsse:Nonce>` |
| **Integritätsnachweis** | Nur während Transport | Dauerhafte kryptografische `<ds:Signature>` (Beweiswert) |
| **Typische Werkzeuge** | `curl`, Bruno, nginx/Gateway | **SoapUI Open Source 5.10.1** (`WSS Configurations`) |

## 3. Geführter Walkthrough (`SoapUI Open Source 5.10.1`)

*(Voraussetzung: Dieses Modul nutzt unseren lokalen SOAP-/WSS-Container + Keystores aus [Advanced A00: Eigenes Docker-Labor](../../advanced/A00-lokales-labor-docker.md).)*

Der lokale SOAP-Service bietet unter `http://localhost:9000/soap/secure` einen dedizierten WS-Security-Endpunkt (WSDL in [order-service-wss-soapui-project.xml](../../collections/soapui/order-service-wss-soapui-project.xml) vorkonfiguriert).

### Der verbindliche Sieben-Schritte-Workflow in SoapUI OS

1. **WS-Security Configurations öffnen:** Doppelklick auf das Projekt `OrderServiceWSS` → Tab **WS-Security Configurations** (*Outgoing WS-Security Configurations*, *Incoming WS-Security Configurations*, *Keystores*, *Truststores*).
2. **Keystore & Truststore laden:** Unter *Keystores* `lab/certs/out/client-keystore.jks` (Passwort `CHANGE_ME_LAB_ONLY`, Alias `api-lab-client`) und unter *Truststores* `lab/certs/out/lab-truststore.jks` hinzufügen. Prüfe zwingend, dass die Spalte **Status** den Wert **`OK`** anzeigt!
3. **Outgoing WS-Security Configuration anlegen:** Name z. B. `LabOutgoingWSS`, Default Username `lab-wss-user`, Default Password `CHANGE_ME_LAB_WSS_PASS`.
   > **Kritischer Fallstrick:** Einträge in der Outgoing-Liste werden **strikt von oben nach unten** auf die Nachricht angewendet!
4. **Sicherheits-Einträge in exakter Reihenfolge ergänzen:**
   - **1. `Timestamp`:** `Time To Live` = `300` (Sekunden).
   - **2. `Username`:** `Add Nonce` = aktiv, `Add Created` = aktiv, `Password Type` = **`PasswordDigest`** (oder `PasswordText` zum Vergleich).
   - **3. `Signature`:** Keystore `client-keystore.jks`, Alias `api-lab-client`, Password `CHANGE_ME_LAB_ONLY`, `Key Identifier Type` = `Binary Security Token` (damit das Zertifikat mitsigniert wird), und in der **Parts**-Tabelle `Body` (`http://schemas.xmlsoap.org/soap/envelope/`, Encode: `Element` oder `Content`) sowie optional `Timestamp` (`http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd`) eintragen.
   - *(Optional `Encryption`: Symmetrische Verschlüsselung des `Body` via `AES-128` und Schlüsselverschlüsselung via RSA-OAEP.)*
5. **Auf Request anwenden & Raw-Tab prüfen:** Im Request unter *Auth* das **Outgoing WSS** Profil `LabOutgoingWSS` wählen (oder Rechtsklick im XML-Editor → *Apply Outgoing WSS*), senden und im **Raw-Tab** den generierten `<wsse:Security>`-Header inspizieren.
6. **Incoming WS-Security konfigurieren:** Unter *Incoming WS-Security Configurations* `LabIncomingWSS` mit `Decrypt Keystore` / `Signature Keystore` anlegen und über den **WSS Inspector** an der Response prüfen.
7. **WS-Security Status Assertion hinzufügen:** Im `TestCase` auf dem Request-Step eine Assertion vom Typ **WS-Security Status** (sowie **XPath Match** auf `//tns:signatureVerified = 'true'`) hinzufügen.

## 4. Typische Fallstricke und Troubleshooting

| Fehlerbild | Ursache | Diagnose & Lösung |
| :--- | :--- | :--- |
| Server lehnt Signatur mit `wsse:FailedCheck` ab | Falsche Reihenfolge im Outgoing-WSS-Profil (z. B. `Signature` vor `Timestamp`, sodass der Timestamp nicht signiert wurde) | Reihenfolge auf `Timestamp` → `Username` → `Signature` korrigieren |
| `Timestamp ist abgelaufen` / `Clock Skew` | Rechneruhr weicht > 60s von Container-UTC ab oder gespeicherter Header wurde zu spät erneut gesendet | `date -u` mit Container-Zeit abgleichen; TTL ausreichend gross wählen (z. B. `300s`) |
| Keystore-Spalte zeigt Fehlermeldung statt `OK` | Falsches Keystore-Passwort, fehlende Datei (`generate-certs.sh` nicht ausgeführt) oder JKS vs. PKCS12-Mismatch | `./lab/certs/generate-certs.sh` ausführen und Keystore-Passwort in SoapUI prüfen |
| Manipulation eines Zeichens im `<soap:Body>` wird akzeptiert | `Parts`-Tabelle der `Signature` in SoapUI war leer oder falscher Endpoint (`/soap` statt `/soap/secure`) | Ziel-URL `http://localhost:9000/soap/secure` und `Parts`-Eintrag für `Body` prüfen |

## 5. Spickzettel (Cheat Sheet)

| WS-Security Element | Zweck |
| :--- | :--- |
| `<wsu:Timestamp>` | Begrenzt Gültigkeitsfenster (`Created` / `Expires`) gegen Replay-Angriffe |
| `<wsse:UsernameToken>` | Authentifiziert Aufrufer via `PasswordText` oder `PasswordDigest` (`SHA1(Nonce + Created + Pass)`) |
| `<ds:Signature>` | XML-Signatur über Body/Timestamp; bricht bei 1-Byte-Änderung |
| `Status: OK` | Pflichtstatus in SoapUI unter *Keystores* / *Truststores* |
| `WS-Security Status` | SoapUI-Assertion zur automatisierten WSS-Prüfung |

## 6. Querverweise

- **Übung:** [M08-uebung.md](../../02-uebungen/M08-uebung.md)
- **Musterlösung:** [M08-loesung.md](../../03-loesungen/M08-loesung.md)
- **SoapUI WSS-Projekt:** [order-service-wss-soapui-project.xml](../../collections/soapui/order-service-wss-soapui-project.xml)
