# Musterlösung M06: OpenAPI `securitySchemes` & kombinierte Anforderungen

## Lösung Aufgabe A: Ergänzte Pfade

```yaml
  /anything/oidc-profile:
    get:
      operationId: getOidcProfile
      security:
        - oidcAuth:
            - openid
      responses:
        "200":
          description: OIDC-geschuetztes Profil

  /anything/admin:
    put:
      operationId: updateAdminConfig
      security:
        - mtlsAuth: []
          apiKeyAuth: []
      responses:
        "200":
          description: Admin-Konfiguration aktualisiert
```

## Lösung Aufgabe B: Die drei Fehler im Snippet

1. **`openapi: 3.0.3` → `openapi: 3.1.0`:** `type: mutualTLS` existiert erst seit OpenAPI 3.1.
2. **Undefiniertes Schema `bearer`:** `bearer` fehlte unter `components.securitySchemes` (und `/public` benötigt `security: []`, sobald ein globales `security` gesetzt ist).
3. **Falsche UND- statt ODER-Logik in `/either`:**
   ```yaml
   security:
     - key: []
     - bearer: []
   ```

## Lösung Aufgabe C: Bruno CLI Import

```bash
bru import openapi \
  --source 01-module/M06-openapi-security-schemes/openapi-security-demo.yaml \
  --output /tmp/partner-bruno \
  --collection-name "Partner Security" \
  --collection-format=opencollection
```

## Lösung Bonus-Challenge D: OpenAPI 3.2 Snippet

```yaml
components:
  securitySchemes:
    deviceOAuth:
      type: oauth2
      oauth2MetadataUrl: http://localhost:8081/realms/api-lab/.well-known/oauth-authorization-server
      flows:
        deviceAuthorization:
          deviceAuthorizationUrl: http://localhost:8081/realms/api-lab/protocol/openid-connect/auth/device
          tokenUrl: http://localhost:8081/realms/api-lab/protocol/openid-connect/token
          scopes:
            orders:read: Bestellungen per CLI lesen
```
