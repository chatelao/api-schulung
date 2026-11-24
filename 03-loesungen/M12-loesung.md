# Musterlösung M12: Token-Lebenszyklus, Sicherheits-Audits & CI/CD

## Lösung Aufgabe A: Introspection & Revocation

Siehe ausführbares Referenzskript: [scripts/curl/m12-introspect-revoke.sh](../../scripts/curl/m12-introspect-revoke.sh).

## Lösung Aufgabe B: Security-Audit-Suite in Bruno CLI

```bash
set -a && source lab/.env && set +a
(
  cd collections/bruno/security-audit-suite
  bru run -r --env ci \
    --env-var "m2mClientSecret=${KC_M2M_CLIENT_SECRET}" \
    --reporter-junit /tmp/m12-audit-junit.xml \
    --reporter-skip-headers Authorization
)
```

Alle 6 Negativtests (`01-invalid-redirect-uri` bis `06-tampered-jwt-header`) prüfen ihre erwarteten Fehlercodes (`400`, `401`, `active: false`) und schließen mit Exit-Code `0` ab.

## Lösung Bonus-Challenge D: mTLS (RFC 8705) vs. DPoP (RFC 9449)

- **mTLS-bound Tokens (RFC 8705):** Bevorzugt bei Server-to-Server / B2B-Integrationen, wo eine eigene PKI/Zertifikatsverteilung vorhanden ist und TLS bis zum Gateway/Backend terminiert wird.
- **DPoP (RFC 9449):** Bevorzugt bei Browser-SPAs, Mobile Apps und CLIs, die keine X.509-Client-Zertifikate ausrollen können, aber dennoch Replay-Schutz über pro-Request signierte `DPoP`-Proof-JWTs benötigen.
