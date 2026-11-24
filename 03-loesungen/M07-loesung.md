# Musterlösung M07: TLS, Custom CA & Mutual TLS (mTLS)

## Lösung Aufgabe A & B: Bruno Desktop (`auth-hygiene-lab`)
1. Mit aktivierter Custom CA (`lab/certs/out/ca.crt` unter *Preferences → General*) liefert `01-custom-ca-tls` (`https://localhost:8444/headers`) **`200 OK`**.
2. Ohne Client-Zertifikat antwortet `https://localhost:8443/headers` mit **`400 Bad Request`** (*No required SSL certificate was sent*).
3. Nach Hinterlegen von `client.crt` + `client.key` für Domain `localhost` in *Collection Settings → Client Certificates* liefert `02-mtls-verified` **`200 OK`** mit `"X-Client-Cert-Verify": ["SUCCESS"]` und `"X-Client-Cert-Dn": ["CN=api-lab-client,..."]`.

## Lösung Aufgabe C & Bonus D
- Die PKCS#12-Datei (`client.pfx`) bündelt Zertifikat und Schlüssel in einer passwortgeschützten Datei (`CHANGE_ME_LAB_ONLY`).
- `client-cert-config.example.json` (`"enabled": true`) dient als Vorlage für automatisierte Läufe im Terminal/CI, da die Kommandozeilen-Version von Bruno (`bru run`) die persönlichen GUI-Preferences nicht mitliest.

*(Für `curl`- und `openssl`-Befehle siehe [Advanced A04](../advanced/A04-tls-mtls-openssl-curl.md).)*
