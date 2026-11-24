# Musterlösung M01: HTTP-Fundament & `curl` ohne Magie

## Lösung Aufgabe A: Echo & Redirect-Analyse

```bash
# 1. Custom-Header pruefen
curl -sS -H "X-Kurs-Teilnehmer: api-student" \
  http://localhost:8180/anything/kurs | jq '.headers'

# 2. Redirect-Kette ohne -L (einmaliger 302) vs. mit -L (3x 302 -> 200 OK)
curl -i http://localhost:8180/redirect/3
curl -sSL -D - -o /dev/null http://localhost:8180/redirect/3 | grep -E "^(HTTP/|Location:)"
```

## Lösung Aufgabe B: Gezielte Fehlercodes

```bash
# 415 Unsupported Media Type (Content-Type passt nicht zu application/json / application/xml)
curl -sS -o /dev/null -w "415-Test -> HTTP %{http_code}\n" \
  -X POST http://localhost:8080/api/v3/pet \
  -H "Content-Type: text/plain" \
  -d '{"id": 999}'

# 404 Not Found
curl -sS -o /dev/null -w "404-Test -> HTTP %{http_code}\n" \
  http://localhost:8080/api/v3/pet/99999999

# 405 Method Not Allowed (DELETE auf Collection-Endpunkt /pet ohne ID)
curl -sS -o /dev/null -w "405-Test -> HTTP %{http_code}\n" \
  -X DELETE http://localhost:8080/api/v3/pet
```

## Lösung Aufgabe C: Vollständiges CRUD-Skript

Siehe ausführbare Referenzdatei: [scripts/curl/m01-petstore-crud.sh](../../scripts/curl/m01-petstore-crud.sh).

## Lösung Bonus-Challenge D: Timing-Messung

```bash
curl -sS -o /dev/null \
  -w '{"http_code":%{http_code},"dns":%{time_namelookup},"connect":%{time_connect},"ttfb":%{time_starttransfer},"total":%{time_total}}\n' \
  "http://localhost:8080/api/v3/pet/findByStatus?status=available" | jq .
```
