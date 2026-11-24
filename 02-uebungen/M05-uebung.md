---
module_id: M05
title: "Klassische Credentials & Secret-Hygiene"
level: "Stufe 2 - Sicherheit"
duration_minutes: 90
tools: ["curl", "Bruno (OpenCollection YAML)", "SoapUI Open Source 5.10.1", "git"]
standards: ["RFC 7617", "RFC 7616", "RFC 6750"]
lab_services: ["go-httpbin"]
prerequisites: ["M01", "M02"]
---

# Übung M05: Klassische Credentials & Secret-Hygiene

## 1. Szenario und Zielzustand

Ein Security-Audit hat gezeigt, dass Entwickelnde bisher Passwörter direkt per `curl -u user:pass` eingegeben und API-Keys in Bruno-Umgebungsdateien committet haben. Du sollst gegen `go-httpbin` (`http://localhost:8180`) alle vier klassischen Verfahren (**Basic**, **Digest**, **API-Key** und **Bearer Token**) umsetzen, ohne dass ein einziges Secret in der Shell-Historie oder in Git-Dateien landet.

## 2. Aufgabenpakete

### Aufgabe A: Sichere `curl`-Aufrufe ohne CLI-Passwörter
1. Lade die Platzhalter-Credentials aus `lab/.env` (`source lab/.env` nach `set -a`).
2. Rufe `http://localhost:8180/basic-auth/${HTTPBIN_BASIC_USER}/${HTTPBIN_BASIC_PASS}` über `curl -K -` (`stdin`) ab und prüfe HTTP `200 OK`.
3. Rufe `http://localhost:8180/digest-auth/auth/${HTTPBIN_BASIC_USER}/${HTTPBIN_BASIC_PASS}` mit `curl --digest -K -` ab.
4. Sende `X-Api-Key` an `http://localhost:8180/headers` und ein Bearer-Token an `http://localhost:8180/bearer` (ebenfalls via `-K -`).

### Aufgabe B: Bruno `auth-hygiene-lab` mit `secret: true` & `--env-var`
1. Öffne [collections/bruno/auth-hygiene-lab/](../collections/bruno/auth-hygiene-lab/opencollection.yml) und prüfe `environments/local.yml`: Alle Passwörter/Tokens haben `value: ""` und `secret: true`.
2. Führe die vier Auth-Requests (Ordner `classic-auth/`) über `bru run` aus, indem du die Secrets erst zur Laufzeit via `--env-var` übergibst und Header aus dem Report ausblendest (`--reporter-skip-headers Authorization X-Api-Key`).

### Aufgabe C: Secret-Hygiene-Audit im Repository
1. Verifiziere per `git check-ignore`, dass sowohl `lab/.env` als auch `collections/bruno/auth-hygiene-lab/.env` ignoriert werden.
2. Durchsuche das Arbeitsverzeichnis (`git grep`), um sicherzustellen, dass kein echtes oder aus `.env` kopiertes Passwort in getrackten Dateien liegt.

### Bonus-Challenge D: `--netrc-file` & Base64-Dekodierung beweisen
Führe den Basic-Auth-Request mittels `--netrc-file` aus, schneide den gesendeten `Authorization: Basic ...`-Header aus `curl -v` aus und dekodiere ihn mit `base64 -d`, um im Team zu demonstrieren, warum Basic Auth ohne TLS Klartext ist.

## 3. Gestufte Hilfestellungen

<details>
<summary>Tipp 1 (Konzeptionell): Wie funktioniert -K - (stdin config) in curl?</summary>

`-K -` weist `curl` an, Konfigurationszeilen (`user = "..."`, `header = "..."`, `oauth2-bearer = "..."`) über `stdin` (z. B. ein Heredoc `<<EOF`) einzulesen. Dadurch erscheinen keine Geheimnisse in der Prozessliste (`ps`) oder Befehlszeile.

</details>

<details>
<summary>Tipp 2 (Konkret): bru run Kommando für Aufgabe B</summary>

```bash
set -a && source lab/.env && set +a
cd collections/bruno/auth-hygiene-lab
bru run classic-auth --env local \
  --env-var "basicUser=${HTTPBIN_BASIC_USER}" \
  --env-var "basicPass=${HTTPBIN_BASIC_PASS}" \
  --env-var "apiKey=${HTTPBIN_API_KEY}" \
  --env-var "bearerToken=${HTTPBIN_BEARER_TOKEN}" \
  --reporter-skip-headers Authorization X-Api-Key
```

</details>

## 4. Selbstkontrolle (Definition of Done)

- [ ] Basic, Digest, API-Key und Bearer liefern gegen `go-httpbin` alle HTTP `200 OK`.
- [ ] Kein Kommando übergibt Passwörter im Klartext als CLI-Argument (`-u user:pass`).
- [ ] `collections/bruno/auth-hygiene-lab/environments/local.yml` enthält ausschliesslich leere `value: ""` + `secret: true` für Secrets.
- [ ] `git status` und `scripts/curl/m05-auth-hygiene.sh` melden 0 Fehler und 0 Secret-Leaks.
