# Musterlösung M05: Klassische Credentials & Secret-Hygiene

## Lösung Aufgabe A: Sichere `curl`-Aufrufe

Siehe ausführbares Referenzskript: [scripts/curl/m05-auth-hygiene.sh](../scripts/curl/m05-auth-hygiene.sh).

## Lösung Aufgabe B: Bruno `auth-hygiene-lab` per CLI

```bash
set -a && source lab/.env && set +a
(
  cd collections/bruno/auth-hygiene-lab
  bru run classic-auth --env local \
    --env-var "basicUser=${HTTPBIN_BASIC_USER}" \
    --env-var "basicPass=${HTTPBIN_BASIC_PASS}" \
    --env-var "apiKey=${HTTPBIN_API_KEY}" \
    --env-var "bearerToken=${HTTPBIN_BEARER_TOKEN}" \
    --reporter-skip-headers Authorization X-Api-Key
)
```

## Lösung Aufgabe C: Secret-Hygiene-Audit

```bash
git check-ignore -v lab/.env collections/bruno/auth-hygiene-lab/.env
git status --short
```

## Lösung Bonus-Challenge D: Base64-Nachweis

```bash
printf "labuser:CHANGE_ME_LAB_HTTPBIN" | base64
# Ausgabe: bGFidXNlcjpDSEFOR0VfTUVfTEFCX0hUVFBCSU4=
printf "bGFidXNlcjpDSEFOR0VfTUVfTEFCX0hUVFBCSU4=" | base64 -d
```
