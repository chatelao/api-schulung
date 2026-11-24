window.API_CURRICULUM = [
  {
    id: "setup",
    title: "Sofort-Einstieg — 0 Minuten Installation (Swagger Web UI im Browser)",
    badge: "Zero-Install",
    lessons: [
      {
        id: "M00",
        title: "M00: Zero-Install-Einstieg (Swagger Web UI) & Werkzeug-Überblick",
        duration: 20,
        tools: "Webbrowser (petstore3.swagger.io, httpbin.org)",
        docsPath: "setup/m00-setup/",
        exercisePath: null
      }
    ]
  },
  {
    id: "stufe1",
    title: "Stufe 1 — Grundlagen (Swagger Web UI → Bruno Desktop & SoapUI)",
    badge: "Basis",
    lessons: [
      {
        id: "M01",
        title: "M01: HTTP-Fundament & erste API-Requests (Swagger Web UI)",
        duration: 90,
        tools: "Swagger Web UI (petstore3.swagger.io, httpbin.org), optional Bruno",
        docsPath: "module/M01/",
        exercisePath: "uebungen/M01/"
      },
      {
        id: "M02",
        title: "M02: Swagger / OpenAPI (2.0, 3.0, 3.1) lesen & mit Bruno nutzen",
        duration: 120,
        tools: "Swagger UI, Bruno Desktop (public-Env)",
        docsPath: "module/M02/",
        exercisePath: "uebungen/M02/"
      },
      {
        id: "M03",
        title: "M03: SOAP 1.1/1.2 & WSDL-Verträge in SoapUI Open Source",
        duration: 150,
        tools: "SoapUI OS 5.10.1 (CountryInfo WSDL / optional A00)",
        docsPath: "module/M03/",
        exercisePath: "uebungen/M03/"
      },
      {
        id: "M04",
        title: "M04: Assertions, Request-Chaining, Scripting & Mocking",
        duration: 120,
        tools: "Bruno Desktop (public), SoapUI MockService",
        docsPath: "module/M04/",
        exercisePath: "uebungen/M04/"
      }
    ]
  },
  {
    id: "stufe2",
    title: "Stufe 2 — Credentials, Transport- & Nachrichtensicherheit",
    badge: "Basis",
    lessons: [
      {
        id: "M05",
        title: "M05: Klassische Credentials & Secret-Hygiene",
        duration: 90,
        tools: "HTTPBin Swagger Web UI, Bruno Desktop (secret: true)",
        docsPath: "module/M05/",
        exercisePath: "uebungen/M05/"
      },
      {
        id: "M06",
        title: "M06: OpenAPI securitySchemes & kombinierte Anforderungen",
        duration: 75,
        tools: "Lernstudio, Swagger UI, Bruno Desktop",
        docsPath: "module/M06/",
        exercisePath: "uebungen/M06/"
      },
      {
        id: "M07",
        title: "M07: TLS, Custom Certificate Authorities & Mutual TLS (mTLS)",
        duration: 105,
        tools: "Browser (badssl.com), Bruno Desktop & SoapUI (A00 für mTLS)",
        docsPath: "module/M07/",
        exercisePath: "uebungen/M07/"
      },
      {
        id: "M08",
        title: "M08: SOAP WS-Security (WSS): UsernameToken, Signatur & Enc.",
        duration: 120,
        tools: "SoapUI OS 5.10.1 + Docker-Labor (A00)",
        docsPath: "module/M08/",
        exercisePath: "uebungen/M08/"
      }
    ]
  },
  {
    id: "stufe3",
    title: "Stufe 3 — Moderne Identität: OAuth 2.1 (RFC 9700) & OIDC",
    badge: "Basis",
    lessons: [
      {
        id: "M09",
        title: "M09: OAuth 2.0 vs. RFC 9700 & OAuth 2.1: Architektur & Anti-Patterns",
        duration: 120,
        tools: "Browser Debugger, Lernstudio, Bruno",
        docsPath: "module/M09/",
        exercisePath: "uebungen/M09/"
      },
      {
        id: "M10",
        title: "M10: OAuth-Praxis: Authorization Code + PKCE & Client Credentials",
        duration: 135,
        tools: "Bruno Desktop, SoapUI OS + Docker-Labor (A00)",
        docsPath: "module/M10/",
        exercisePath: "uebungen/M10/"
      },
      {
        id: "M11",
        title: "M11: OpenID Connect (OIDC): Discovery, JWKS, ID Token & /userinfo",
        duration: 120,
        tools: "Browser (demo.duendesoftware.com), Lernstudio, Bruno",
        docsPath: "module/M11/",
        exercisePath: "uebungen/M11/"
      },
      {
        id: "M12",
        title: "M12: Token-Lebenszyklus, Sicherheits-Audits & Automatisierung",
        duration: 120,
        tools: "Bruno Runner + Docker-Labor (A00), GitHub Actions",
        docsPath: "module/M12/",
        exercisePath: "uebungen/M12/"
      }
    ]
  },
  {
    id: "capstone",
    title: "Abschlussprojekt — Hybride Enterprise-Auftragsintegration",
    badge: "Projekt",
    lessons: [
      {
        id: "CAP",
        title: "CAP: OIDC + OpenAPI REST + mTLS + SOAP/WSS End-to-End",
        duration: 180,
        tools: "Bruno Desktop, SoapUI OS + Docker-Labor (A00)",
        docsPath: "capstone/",
        exercisePath: "capstone/rubric/"
      }
    ]
  },
  {
    id: "advanced",
    title: "Advanced-Track — Eigenes Docker-Labor (A00), Shell, curl & CLI",
    badge: "Advanced",
    lessons: [
      {
        id: "A00",
        title: "A00: Eigenes 6-Container-Docker-Labor & Zertifikate aufsetzen",
        duration: 30,
        tools: "Docker Compose, generate-certs.sh, smoke-test.sh",
        docsPath: "advanced/A00/",
        exercisePath: null
      },
      {
        id: "A01",
        title: "A01: HTTP-Fundament & curl ohne Magie (jq & Timing)",
        duration: 45,
        tools: "curl, jq, Bash",
        docsPath: "advanced/A01/",
        exercisePath: "advanced/uebungen/"
      },
      {
        id: "A02",
        title: "A02: SOAP 1.1/1.2 & bytegenauer XML-Versand (--data-binary)",
        duration: 45,
        tools: "curl, bru import wsdl",
        docsPath: "advanced/A02/",
        exercisePath: "advanced/uebungen/"
      },
      {
        id: "A03",
        title: "A03: Secret-Hygiene in der Shell (-K - & --netrc-file)",
        duration: 45,
        tools: "curl -K -, --netrc-file",
        docsPath: "advanced/A03/",
        exercisePath: "advanced/uebungen/"
      },
      {
        id: "A04",
        title: "A04: TLS, OpenSSL & mTLS per curl (--cacert / --cert / P12)",
        duration: 45,
        tools: "curl, openssl",
        docsPath: "advanced/A04/",
        exercisePath: "advanced/uebungen/"
      },
      {
        id: "A05",
        title: "A05: OAuth 2.1 PKCE S256, M2M & OIDC JWKS per curl",
        duration: 60,
        tools: "curl, openssl, jq",
        docsPath: "advanced/A05/",
        exercisePath: "advanced/uebungen/"
      },
      {
        id: "A06",
        title: "A06: Token-Lifecycle (RFC 7662/7009), bru run & CI/CD",
        duration: 60,
        tools: "curl, @usebruno/cli (bru), GitHub Actions",
        docsPath: "advanced/A06/",
        exercisePath: "advanced/uebungen/"
      }
    ]
  }
];
