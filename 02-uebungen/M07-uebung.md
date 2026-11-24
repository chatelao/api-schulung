---
module_id: M07
title: "TLS, Custom Certificate Authorities & Mutual TLS (mTLS)"
level: "Stufe 2 - Sicherheit"
duration_minutes: 105
tools: ["Bruno Desktop (GUI)", "SoapUI Open Source 5.10.1", "Webbrowser"]
standards: ["X.509", "TLS 1.2/1.3", "PEM / PKCS#12 / JKS"]
lab_services: ["tls-proxy", "go-httpbin"]
prerequisites: ["M00", "M05", "M06"]
---

# Übung M07: TLS, Custom CA & Mutual TLS (mTLS) in Bruno & SoapUI

## 1. Szenario und Zielzustand

Ein internes Zahlungsgateway verwendet eine unternehmenseigene Zertifizierungsstelle (**Custom CA**) und verlangt auf dem sensiblen Endpunkt (`https://localhost:8443`) gegenseitige Authentifizierung (**mTLS**). Du lernst TLS-Fehlerbilder zuerst **ohne Installation** über `https://badssl.com/` im Browser kennen und richtest danach in **Bruno Desktop** (und optional **SoapUI OS 5.10.1**) Server-Vertrauen (`ca.crt`) und Client-Zertifikat ein.

*(Voraussetzung für Aufgaben B–C: Eigenes Container-Labor mit Zertifikaten aus [Advanced A00](../advanced/A00-lokales-labor-docker.md).)*

## 2. Aufgabenpakete

### Aufgabe A: Zero-Install TLS-Fehler im Browser (`https://badssl.com/`) & Custom CA (`8444`)
1. Öffne **https://badssl.com/** im Browser und rufe `expired.badssl.com`, `wrong.host.badssl.com` und `self-signed.badssl.com` auf, um drei reale Zertifikatsfehler zu unterscheiden.
2. *(Mit Container-Labor `A00`):* Öffne [collections/bruno/auth-hygiene-lab/](../collections/bruno/auth-hygiene-lab/opencollection.yml) in Bruno Desktop (`local`-Environment aktivieren).
3. Sende im Ordner `TLS & mTLS` den Request `01-custom-ca-tls` (`https://localhost:8444/headers`) und beobachte den Zertifikatsfehler ohne Custom CA.
4. Hinterlege `lab/certs/out/ca.crt` unter *Preferences → General → Custom CA Certificate* (Prüfung bleibt aktiv!) und sende den Request erneut → erwartet `200 OK` mit `"X-Tls-Mode": ["server-tls-custom-ca"]`.

### Aufgabe B: Mutual TLS (`8443`) + Negativtest in Bruno Desktop
1. Sende `02-mtls-verified` (`https://localhost:8443/headers`) noch **ohne** Client-Zertifikat und dokumentiere die Ablehnung (`400 Bad Request`).
2. Hinterlege unter *Collection Settings → Client Certificates* für Domain `localhost` das Paar `lab/certs/out/client.crt` und `lab/certs/out/client.key`.
3. Sende `02-mtls-verified` erneut und prüfe in der Antwort, dass `X-Client-Cert-Verify` den Wert `SUCCESS` und `X-Client-Cert-Dn` deinen Client-Namen `CN=api-lab-client` zeigt.

### Aufgabe C: `client.pfx` & `client-keystore.jks` (SoapUI OS 5.10.1)
1. Teste in Bruno alternativ den Zertifikatstyp **PFX** mit `lab/certs/out/client.pfx` (Passwort `CHANGE_ME_LAB_ONLY`).
2. Öffne in **SoapUI OS 5.10.1** *File → Preferences → SSL Settings* und trage `lab/certs/out/client-keystore.jks` ein, um zu sehen, wie Java-Clients Zertifikate verwalten.

### Bonus-Challenge D: CI-Vorlage `client-cert-config.example.json` verstehen
Öffne [client-cert-config.example.json](../collections/bruno/auth-hygiene-lab/client-cert-config.example.json) in einem Texteditor und erkläre, warum neben der GUI-Einstellung auch eine solche JSON-Datei für automatisierte Pipeline-Läufe benötigt wird.

> **Hinweis:** Die Shell-Übungen mit `openssl` und `curl` findest du in [Advanced A04](../advanced/A04-tls-mtls-openssl-curl.md).

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Warum haben Collection-Zertifikate Vorrang vor globalen?</summary>

Wenn ein Entwicklerteam an mehreren Projekten mit unterschiedlichen Kunden-Zertifikaten arbeitet, schützt die Collection-Einstellung davor, versehentlich das falsche Firmenzertifikat zu senden.

</details>

<details>
<summary>Tipp 2 (Konkret): Wo liegt das Passwort für client.pfx und client-keystore.jks?</summary>

Im Labor lautet das Standard-Passwort für beide Container-Dateien `CHANGE_ME_LAB_ONLY` (konfiguriert in `lab/.env.example`).

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] `01-custom-ca-tls` (`8444`) liefert mit hinterlegter `ca.crt` HTTP `200 OK` (ohne Deaktivierung der SSL-Prüfung).
- [ ] `02-mtls-verified` (`8443`) wird ohne Client-Zertifikat mit HTTP `400` abgelehnt.
- [ ] `02-mtls-verified` (`8443`) liefert mit Client-Zertifikat `X-Client-Cert-Verify: SUCCESS`.
