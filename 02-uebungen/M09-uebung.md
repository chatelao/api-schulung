---
module_id: M09
title: "OAuth 2.0 vs. RFC 9700 & OAuth 2.1: Architektur & Anti-Patterns"
level: "Stufe 3 - Experten"
duration_minutes: 120
tools: ["curl", "openssl", "jq"]
standards: ["RFC 6749", "RFC 9700 (BCP 240)", "RFC 10017", "OAuth 2.1 (Draft-17)", "RFC 7636"]
lab_services: ["keycloak", "mock-oauth2"]
prerequisites: ["M05", "M06", "M07"]
---

# Übung M09: OAuth 2.0 vs. RFC 9700 & OAuth 2.1

## 1. Szenario und Zielzustand

Im Rahmen eines Security-Reviews prüfst du den neuen Keycloak-Client `bruno-pkce-client` auf Konformität mit **RFC 9700** und **OAuth 2.1**. Du sollst manuell ein `S256`-PKCE-Paar berechnen, die Ablehnung unsicherer Flows (`Implicit`, fehlendes PKCE, `plain`) per `curl` nachweisen und eine manipulierte Code-Verifikation am Token-Endpunkt von `mock-oauth2-server` diagnostizieren.

## 2. Aufgabenpakete

### Aufgabe A: PKCE-Berechnung von Hand (ohne SDK)
1. Erzeuge per `openssl rand` einen `code_verifier` (Base64URL, ohne `=`-Padding).
2. Berechne daraus die `code_challenge` mit `SHA-256` und Base64URL-Kodierung.
3. Prüfe, warum `printf '%s'` statt `echo` Pflicht ist.

### Aufgabe B: Härtungs-Audit gegen Keycloak (`bruno-pkce-client`)
Führe vier `curl`-Tests gegen `http://localhost:8081/realms/api-lab/protocol/openid-connect/auth` aus und belege die exakten HTTP-Statuscodes sowie `Location`-Fehlerparameter:
1. `response_type=token` (Implicit Grant) → erwartet `302` mit `#error=unauthorized_client`
2. `response_type=code` ohne `code_challenge` → erwartet `302` mit `?error=invalid_request`
3. `response_type=code` mit `code_challenge_method=plain` → erwartet `302` mit `?error=invalid_request`
4. `response_type=code` mit `code_challenge_method=S256` → erwartet `200` (Login-Maske)

### Aufgabe C: Code-Interception-Abwehr (falscher `code_verifier`)
1. Prüfe gegen Keycloak oder `mock-oauth2-server` (`http://localhost:8090/default/token`), wie der Token-Endpunkt reagiert, wenn ein abgefangener `code` mit einem falschen `code_verifier` eingereicht wird.
2. Erkläre in 3 Sätzen, warum ein Angreifer auch dann scheitert, wenn er den Authorization Code auf dem Rückweg abfängt.

### Bonus-Challenge D: Legacy-ROPC-Audit auf Keycloak prüfen
Sende eine `client_credentials` vs. `password`-Anfrage an `bruno-pkce-client` (erwartete Ablehnung `unauthorized_client`) und vergleiche dies mit dem isolierten Audit-Client `legacy-ropc-audit-client` (`http://localhost:8081/realms/api-lab/protocol/openid-connect/token`).

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Wie kodiert man Base64URL korrekt in Bash?</summary>

Normales Base64 verwendet `+`, `/` und `=`-Padding. Für Base64URL (RFC 4648 §5) ersetzt man `+` durch `-`, `/` durch `_` und entfernt alle `=` (`tr '+/' '-_' | tr -d '='`).

</details>

<details>
<summary>Tipp 2 (Konkret): Skript-Referenz für Aufgabe A und B</summary>

Starte und inspiziere [scripts/curl/m09-pkce-manual.sh](../scripts/curl/m09-pkce-manual.sh), das alle Prüfungen automatisiert durchführt.

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] `code_verifier` und `S256` `code_challenge` wurden fehlerfrei (ohne Newline-Bug) berechnet.
- [ ] Keycloak lehnt `Implicit`, fehlendes PKCE und `plain` auf `bruno-pkce-client` nachweisbar mit HTTP `400` ab.
- [ ] `scripts/curl/m09-pkce-manual.sh` läuft erfolgreich durch.
- [ ] Du kannst den Schutzmechanismus von PKCE gegen Code-Interception präzise erklären.
