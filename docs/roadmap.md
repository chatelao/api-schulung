# ROADMAP.md — Ausbaupfad des Curriculums

Dieses Dokument beschreibt geplante Erweiterungen für zukünftige Releases von `api-schulung`.

## Kurzfristig (Q1 2027)

- **OpenAPI 3.2 Vertiefung:** Praktische Übungen mit `oauth2MetadataUrl` (RFC 8414) und `flows.deviceAuthorization` (RFC 8628) in Bruno.
- **DPoP-Praxis-Lab (RFC 9449):** Interaktive Generierung von DPoP-Proof-JWTs per `node`/OpenSSL und Verifikation gegen einen DPoP-fähigen Resource Server im lokalen Labor.
- **Device Authorization Grant (RFC 8628):** Vollständiger CLI-Workflow gegen Keycloak im Docker-Labor.

## Mittelfristig (Q2–Q3 2027)

- **GraphQL-Modul (M13):** Schema-Introspektion, Queries/Mutations, N+1-Analyse und Sicherheits-Härtung (Query Depth Limiting) mit `curl` und Bruno.
- **gRPC & Protobuf (M14):** `.proto`-Verträge, `grpcurl` und Bruno-gRPC-Support inklusive Server-Streaming und mTLS.
- **Contract Testing (M15):** Consumer-Driven Contracts mit Specmatic oder Pact im Zusammenspiel mit OpenAPI-3.1-Spezifikationen.

## Langfristig

- **API-Gateway- & Rate-Limiting-Lab:** Lokaler Envoy-/Traefik-Proxy für Retry-After-, Circuit-Breaker- und Token-Introspection-Szenarien.
- **Mehrsprachige Ausgabe:** Englische Parallelversion (`en/`) für internationale Teams.
