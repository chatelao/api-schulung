---
module_id: M07
title: "TLS, Custom Certificate Authorities & Mutual TLS (mTLS)"
level: "Stufe 2 - Sicherheit"
duration_minutes: 105
tools: ["Bruno Desktop (GUI)", "SoapUI Open Source 5.10.1", "Webbrowser"]
standards: ["X.509", "TLS 1.2/1.3", "RFC 8446", "PEM / PKCS#12 / JKS"]
lab_services: ["tls-proxy", "go-httpbin"]
prerequisites: ["M00", "M05", "M06"]
---

# Modul 7: TLS, Custom Certificate Authorities & Mutual TLS (mTLS)

## 1. Lernziele

Nach Abschluss dieses Moduls kannst du:
1. Zwischen **Server-Vertrauen** (Custom CA / Truststore: *«Ist der Server echt?»*) und **Client-Identität** (Client-Zertifikat / Keystore: *«Wer ruft die API auf?»*) anschaulich **unterscheiden**.
2. TLS-Warnungen sauber lösen, indem du der internen **Custom CA** vertraust — statt die Zertifikatsprüfung einfach abzuschalten.
3. **Mutual TLS (mTLS)** in **Bruno Desktop** (Preferences + Collection Settings) und **SoapUI Open Source 5.10.1** (SSL Settings) **einrichten**.
4. Einen fehlgeschlagenen mTLS-Handshake ohne Client-Zertifikat (`400 No required SSL certificate was sent`) sicher **einordnen**.

## 2. Architektur und Kernkonzepte (ohne Netzwerk-Vorwissen)

Wenn du im Browser das **Schloss-Symbol (`https://`)** siehst, läuft ein verschlüsselter **TLS-Tunnel**. Normalerweise prüft dabei **nur dein Client** den Ausweis (das *Zertifikat*) des Servers anhand einer Liste bekannter, öffentlicher Aussteller (*Certificate Authorities*, kurz **CA**).

In Firmennetzen gibt es oft **zwei Besonderheiten**:
1. **Eigene interne Aussteller (Custom CA):** Interne Server haben Ausweise, die von der eigenen Firmen-CA unterschrieben sind (`lab/certs/out/ca.crt`). Dein Tool kennt diese Firmen-CA anfangs noch nicht und warnt deshalb (*untrusted certificate*). Die richtige Lösung ist **nicht** «Prüfung ausschalten», sondern die Firmen-CA einmalig als vertrauenswürdig hinterlegen!
2. **Gegenseitige Prüfung (Mutual TLS / mTLS):** Bei besonders sensiblen APIs (`https://localhost:8443`) verlangt der Server **ebenfalls** einen Ausweis von dir — ein **Client-Zertifikat** (`client.crt` + `client.key` bzw. das kombinierte Paket `client.pfx`).

### Vergleichstabelle: TLS & mTLS in Bruno Desktop vs. SoapUI OS 5.10.1

| Aspekt | Bruno Desktop (v4.1+) | SoapUI Open Source 5.10.1 |
| :--- | :--- | :--- |
| **Custom CA (Server-Trust)** | *Preferences → General → Custom CA Certificate* (`ca.crt`) | Java Truststore (`lab-truststore.jks`) in *SSL Settings* |
| **Client-Zertifikat (mTLS)** | *Collection Settings → Client Certificates* (Domain `localhost`, `client.crt` + `client.key` oder `client.pfx`) | *File → Preferences → SSL Settings → KeyStore* (`client-keystore.jks`) |
| **Vorrang-Regel** | Aktivierte Collection-Zertifikate haben bei gleicher Domain Vorrang vor globalen Zertifikaten | Projekt-/Global-SSL-Einstellungen |

## 3. Geführter Walkthrough (`Bruno Desktop` & `SoapUI`)

*(Voraussetzung aus [M00](../../00-setup/README.md): Die Zertifikate unter `lab/certs/out/` wurden beim Setup erzeugt.)*

### `Bruno Desktop`: Custom CA (`8444`) & mTLS (`8443`)

1. Öffne [collections/bruno/auth-hygiene-lab/](../../collections/bruno/auth-hygiene-lab/opencollection.yml) und wähle Environment **`local`**.
2. **Negativtest zuerst:** Sende im Ordner `TLS & mTLS` den Request `01-custom-ca-tls` (`https://localhost:8444/headers`) — es erscheint ein Zertifikatsfehler, weil Bruno unsere Labor-CA noch nicht kennt.
3. **Custom CA hinterlegen:** Öffne in Bruno *Preferences → General → Custom CA Certificate*, aktiviere es und wähle `lab/certs/out/ca.crt`. Sende `01-custom-ca-tls` erneut → **`200 OK`**!
4. **mTLS-Negativtest:** Sende nun `02-mtls-verified` (`https://localhost:8443/headers`) noch *ohne* Client-Zertifikat → der Server lehnt mit **`400 Bad Request` (`No required SSL certificate was sent`)** ab.
5. **Client-Zertifikat hinterlegen:** Öffne *Collection Settings → Client Certificates → + Add Certificate*:
   - **Domain:** `localhost`
   - **Type:** `Cert & Key` (oder `PFX` mit `client.pfx` + Passwort `CHANGE_ME_LAB_ONLY`)
   - **Cert:** `lab/certs/out/client.crt`, **Key:** `lab/certs/out/client.key`
   Sende `02-mtls-verified` erneut → **`200 OK`** und `"X-Client-Cert-Verify": ["SUCCESS"]`!

### `SoapUI Open Source 5.10.1`

Öffne *File → Preferences → SSL Settings*:
- **KeyStore:** `lab/certs/out/client-keystore.jks`, KeyStore Password: `CHANGE_ME_LAB_ONLY`
- Haken bei **Requires Client Authentication** setzen.

> **Für Fortgeschrittene (Shell, OpenSSL & CI):** Wie man Zertifikate mit `openssl` prüft, mTLS per `curl` testet und Zertifikate in CI per `--client-cert-config` übergibt, beschreibt [Advanced A04: TLS & mTLS per curl](../../advanced/A04-tls-mtls-openssl-curl.md).

## 4. Typische Fallstricke und Troubleshooting

| Fehlerbild | Ursache | Lösung |
| :--- | :--- | :--- |
| Zertifikatsfehler trotz `--ignore`? | SSL-Verifikation abzuschalten verdeckt echte Sicherheitsprobleme | Immer `ca.crt` unter *Preferences → General* hinterlegen (niemals SSL-Prüfung global abschalten!) |
| Port `8443` liefert `400 No required SSL certificate was sent` | Client-Zertifikat fehlt oder Domain-Eintrag passt nicht | In *Collection Settings → Client Certificates* exakt `localhost` und aktivierte Checkbox prüfen |
| `lab/certs/out/` existiert nicht | Zertifikats-Setup aus M00 fehlt | Einmalig `./lab/certs/generate-certs.sh` gemäss [M00](../../00-setup/README.md) ausführen |

## 5. Spickzettel (Cheat Sheet)

| Datei in `lab/certs/out/` | Zweck |
| :--- | :--- |
| `ca.crt` | Öffentliches Zertifikat der Labor-Root-CA (Server-Vertrauen) |
| `client.crt` + `client.key` | Client-Ausweis + privater Schlüssel (für Bruno / `curl`) |
| `client.pfx` | Kombiniertes PKCS#12-Paket mit Passwort (`CHANGE_ME_LAB_ONLY`) |
| `client-keystore.jks` / `lab-truststore.jks` | Java-Keystores speziell für **SoapUI OS 5.10.1** |

## 6. Querverweise

- **Übung:** [M07-uebung.md](../../02-uebungen/M07-uebung.md)
- **Musterlösung:** [M07-loesung.md](../../03-loesungen/M07-loesung.md)
- **Bruno Collection:** [auth-hygiene-lab](../../collections/bruno/auth-hygiene-lab/opencollection.yml)
- **Advanced (Shell/`curl`/`openssl`):** [A04-tls-mtls-openssl-curl.md](../../advanced/A04-tls-mtls-openssl-curl.md)
