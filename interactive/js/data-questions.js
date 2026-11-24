window.API_CHECKPOINTS_META = [
  { id: "CP-0", label: "CP-0: Einstieg (vor M01)" },
  { id: "CP-1", label: "CP-1: Nach Stufe 1 (M04)" },
  { id: "CP-2", label: "CP-2: Nach Stufe 2 (M08)" },
  { id: "CP-3", label: "CP-3: Abschluss (nach M12)" }
];

window.API_CHECKPOINT_QUESTIONS = [
  {
    id: "q1",
    domain: "HTTP & OpenAPI",
    question: "Welcher HTTP-Statuscode entsteht, wenn ein Client reinen Text (text/plain) an einen Endpunkt sendet, der nur JSON akzeptiert?",
    options: ["404 Not Found", "405 Method Not Allowed", "415 Unsupported Media Type", "502 Bad Gateway"],
    answer: 2,
    explain: "415 Unsupported Media Type zeigt an, dass der Content-Type des Request-Bodys vom Server nicht unterstützt wird."
  },
  {
    id: "q2",
    domain: "HTTP & OpenAPI",
    question: "Welche Aussage zum OpenCollection-YAML-Format in Bruno v3/v4 trifft zu?",
    options: [
      ".bru und .yml sollten innerhalb einer Collection beliebig gemischt werden",
      "Jede Collection benötigt opencollection.yml (opencollection: 1.0.0) und sortenreine .yml-Dateien",
      "OpenCollection YAML speichert Passwörter immer im Klartext in environments/*.yml",
      "bru.setEnvVar() ändert Variablen nur flüchtig im RAM"
    ],
    answer: 1,
    explain: "Mischungen aus .bru und .yml führen zu GUI-Fehlern; opencollection.yml ist das Pflicht-Rootfile."
  },
  {
    id: "q3",
    domain: "HTTP & OpenAPI",
    question: "Wie werden zwei Schemas in OpenAPI 3.1 als ODER-Alternative im security-Array notiert?",
    options: [
      "Als zwei Schlüssel im selben Objekt",
      "Als zwei getrennte Listeneinträge (- schemeA: [] und - schemeB: [])",
      "Über type: mutualTLS in OpenAPI 3.0",
      "Durch Weglassen des security-Felds"
    ],
    answer: 1,
    explain: "Im OpenAPI security-Array sind getrennte Listeneinträge ODER-Alternativen, mehrere Schlüssel im selben Objekt dagegen UND-Bedingungen."
  },
  {
    id: "q4",
    domain: "SOAP & WS-Security",
    question: "Woran erkennt ein Server eine SOAP-1.1-Nachricht im Vergleich zu SOAP 1.2?",
    options: [
      "Content-Type: text/xml und separater SOAPAction-HTTP-Header",
      "Content-Type: application/json und Bearer-Header",
      "Content-Type: application/soap+xml ohne SOAPAction",
      "Nur am GET-Methodennamen"
    ],
    answer: 0,
    explain: "SOAP 1.1 nutzt text/xml und einen separaten SOAPAction-Header; SOAP 1.2 nutzt application/soap+xml."
  },
  {
    id: "q5",
    domain: "SOAP & WS-Security",
    question: "In welcher Reihenfolge müssen Einträge in SoapUI Outgoing WS-Security stehen, damit der Timestamp mit signiert wird?",
    options: [
      "Signature -> Username -> Timestamp",
      "Timestamp -> Username -> Signature",
      "Encryption -> Signature -> Timestamp",
      "Reihenfolge spielt keine Rolle"
    ],
    answer: 1,
    explain: "SoapUI wendet Outgoing-WSS-Einträge strikt von oben nach unten an: Erst Timestamp, dann Username, zuletzt Signature."
  },
  {
    id: "q6",
    domain: "SOAP & WS-Security",
    question: "Welche Funktion ist NICHT in SoapUI Open Source 5.10.1 enthalten, sondern erst in ReadyAPI?",
    options: [
      "WSDL-1.1-Import und WS-I Check",
      "XPath Match Assertion und Property Transfer",
      "Codelose Excel-/CSV-DataSource-Loops",
      "Keystore/Truststore für WS-Security"
    ],
    answer: 2,
    explain: "Codelose DataSource-Loops (Excel/CSV) und automatisierte Browser-OAuth-Skripte sind ReadyAPI-Pro-Features."
  },
  {
    id: "q7",
    domain: "TLS & Secret-Hygiene",
    question: "Warum darf HTTP Basic Auth niemals unverschlüsselt über HTTP ohne TLS verwendet werden?",
    options: [
      "Weil Base64 nur eine triviale Kodierung und keine Verschlüsselung ist",
      "Weil HTTP Basic nur 4-stellige Passwörter erlaubt",
      "Weil der Browser Basic Auth blockiert",
      "Weil Basic Auth nur mit XML funktioniert"
    ],
    answer: 0,
    explain: "Base64 lässt sich von jedem Mitleser sofort in Klartext zurückwandeln."
  },
  {
    id: "q8",
    domain: "TLS & Secret-Hygiene",
    question: "Wie löst man einen TLS-Zertifikatsfehler gegen eine interne Firmen-CA professionell?",
    options: [
      "Zertifikatsprüfung dauerhaft abschalten (curl -k / Ignore SSL)",
      "Die interne Root-CA (ca.crt) explizit als Custom CA / Truststore hinterlegen",
      "Von https:// auf http:// wechseln",
      "Passwort in die URL anhängen"
    ],
    answer: 1,
    explain: "Das Abschalten der SSL-Prüfung öffnet Man-in-the-Middle-Angriffen Tür und Tor; korrekt ist das Vertrauen auf die interne CA."
  },
  {
    id: "q9",
    domain: "TLS & Secret-Hygiene",
    question: "Was passiert bei Mutual TLS (mTLS), wenn der Client kein gültiges Client-Zertifikat vorlegt?",
    options: [
      "Der Server antwortet trotzdem mit 200 OK",
      "Der Server weist die Verbindung auf TLS-/HTTP-Ebene (z. B. 400 No required SSL certificate) ab",
      "Das Client-Zertifikat wird automatisch generiert",
      "mTLS prüft nur das Server-Zertifikat"
    ],
    answer: 1,
    explain: "Bei mTLS prüft der Server zusätzlich die kryptografische Identität des Clients."
  },
  {
    id: "q10",
    domain: "OAuth 2.1 & OIDC",
    question: "Welche Flows wurden in RFC 9700 / OAuth 2.1 vollständig entfernt bzw. untersagt?",
    options: [
      "Client Credentials & Device Authorization",
      "Implicit Grant (response_type=token) & Resource Owner Password Credentials (ROPC)",
      "Authorization Code mit PKCE S256",
      "Token Introspection & Revocation"
    ],
    answer: 1,
    explain: "Implicit Grant und ROPC sind wegen Token-/Passwort-Leaks in RFC 9700 und OAuth 2.1 entfernt."
  },
  {
    id: "q11",
    domain: "OAuth 2.1 & OIDC",
    question: "Warum darf ein OIDC ID Token niemals als Bearer Token an eine Fach-API gesendet werden?",
    options: [
      "Weil ID Tokens nicht Base64-kodiert sind",
      "Weil die Zielgruppe (aud) des ID Tokens der Client ist, nicht die API — APIs brauchen das Access Token",
      "Weil ID Tokens kein Ablaufdatum haben",
      "Weil ID Tokens nur in SOAP erlaubt sind"
    ],
    answer: 1,
    explain: "Strikte Token-Trennung: ID Token = Benutzer-Identität für den Client; Access Token = API-Berechtigung."
  },
  {
    id: "q12",
    domain: "OAuth 2.1 & OIDC",
    question: "Wie prüft ein Resource Server zuverlässig, ob ein zuvor gültiges Token inzwischen widerrufen wurde?",
    options: [
      "Nur durch Base64URL-Dekodierung des Payloads",
      "Durch Token Introspection (RFC 7662) nach vorheriger Revocation (RFC 7009)",
      "Durch Erhöhen der Token-Laufzeit",
      "Durch Weitergabe in ?access_token="
    ],
    answer: 1,
    explain: "Rein lokale JWT-Prüfung erkennt Widerrufe nicht sofort; RFC 7662 Introspection liefert den aktuellen Server-Status (active: false)."
  }
];

window.API_FLASHCARDS = [
  { cat: "HTTP", q: "Was bedeutet Idempotenz bei HTTP-Methoden?", a: "Mehrfaches identisches Ausführen erzeugt denselben Serverzustand wie ein einmaliger Aufruf (z. B. GET, PUT, DELETE — nicht POST).", hint: "Wichtig für sichere Retries nach Netzwerkfehlern." },
  { cat: "HTTP", q: "Unterschied zwischen 401 Unauthorized und 403 Forbidden?", a: "401: Identität fehlt oder Token ungültig/abgelaufen. 403: Identität bekannt, aber fehlender Scope oder fehlende Rolle.", hint: "Bei 401 hilft meist erneutes Anmelden; bei 403 fehlen Rechte." },
  { cat: "OpenAPI", q: "Wie deklariert man einen explizit öffentlichen Endpunkt trotz globalem security?", a: "Mit security: [] direkt an der jeweiligen Operation.", hint: "Nützlich für /health oder /status." },
  { cat: "OpenAPI", q: "Was gilt bei security: [ { mtls: [], oauth2: ['admin'] } ]?", a: "UND-Verknüpfung: Beide Anforderungen müssen gleichzeitig erfüllt sein.", hint: "Zwei separate Listeneinträge (-) wären dagegen ODER." },
  { cat: "Bruno", q: "Unterschied zwischen bru.setVar() und bru.setEnvVar()?", a: "setVar() speichert nur flüchtig im Arbeitsspeicher; setEnvVar() persistiert in Bruno v4 auf die Festplatte (Git-Diff-Risiko).", hint: "Tokens/IDs immer mit bru.setVar()." },
  { cat: "Bruno", q: "Wie schützt Bruno Secrets in environments/*.yml?", a: "Mit secret: true und leerem value: \"\" — der eigentliche Wert liegt nur lokal verschlüsselt oder wird via --env-var injiziert.", hint: "Niemals Secrets im Klartext committen!" },
  { cat: "SOAP", q: "Welchen Content-Type und Header verlangt SOAP 1.1?", a: "Content-Type: text/xml; charset=utf-8 und einen expliziten HTTP-Header SOAPAction.", hint: "SOAP 1.2 nutzt stattdessen application/soap+xml." },
  { cat: "SOAP", q: "Was prüft WS-Security im Gegensatz zu TLS?", a: "Nachrichtenbasierte Ende-zu-Ende-Sicherheit im <soap:Header> (Timestamp, UsernameToken, XML-Signatur), auch über Gateways/ESBs hinweg.", hint: "TLS endet am Proxy; WSS bleibt in der Nachricht." },
  { cat: "TLS/mTLS", q: "Was trennt man bei Custom CA vs. mTLS?", a: "Custom CA (ca.crt) = Server-Vertrauen (Client prüft Server). Client-Zertifikat (client.crt/key) = Client-Identität (Server prüft Client).", hint: "Niemals curl -k / SSL-Ignore als Dauerlösung!" },
  { cat: "OAuth 2.1", q: "Welche PKCE-Methode ist nach RFC 9700 / OAuth 2.1 Pflicht?", a: "Ausschiesslich S256 (SHA-256 + Base64URL). Die Methode plain ist verboten.", hint: "Schützt gegen Code-Interception." },
  { cat: "OIDC", q: "Warum gilt «Dekodieren ≠ Verifizieren» bei JWTs?", a: "Base64URL-Dekodierung macht Header/Payload nur lesbar — erst die Signaturprüfung gegen den passenden key (kid) aus jwks_uri beweist Echtheit.", hint: "Jeder kann einen unsignierten JWT-Text fälschen." },
  { cat: "OAuth 2.1", q: "Was leisten RFC 8705 (mTLS) und RFC 9449 (DPoP)?", a: "Sender-Constrained Tokens: Binden das Access Token kryptografisch an einen Client-Schlüssel, sodass gestohlene Tokens wertlos sind.", hint: "Schutz gegen Bearer-Token-Diebstahl." },
  { cat: "Advanced (curl)", q: "Warum nutzt man bei curl --data-binary @req.xml statt -d?", a: "-d entfernt Zeilenumbrüche (\n/\r), was XML-Strukturen und XML-Signaturen bricht; --data-binary sendet bytegenau.", hint: "Siehe Advanced A02." },
  { cat: "Advanced (curl)", q: "Wie verhindert man Klartext-Passwörter in ~/.bash_history?", a: "Mit curl -K - (stdin), --netrc-file (chmod 600) oder Umgebungsvariablen statt -u user:pass.", hint: "Siehe Advanced A03." }
];

window.API_MOCK_EXAM_QUESTIONS = [
  ...window.API_CHECKPOINT_QUESTIONS,
  {
    id: "q13",
    domain: "Advanced (curl & CI)",
    question: "Warum funktioniert mTLS in der Bruno Desktop GUI, schlägt aber bei bru run im Terminal fehl, wenn man keine Flags übergibt?",
    options: [
      "Bruno CLI unterstützt überhaupt kein HTTPS",
      "Die Bruno CLI liest keine globalen GUI-Preferences aus und benötigt explizit --cacert und --client-cert-config",
      "Weil bru run nur SOAP unterstützt",
      "Weil curl installiert sein muss"
    ],
    answer: 1,
    explain: "Für CI/CD und bru run müssen Custom CA (--cacert) und Client-Zertifikate (--client-cert-config mit enabled: true) explizit übergeben werden."
  },
  {
    id: "q14",
    domain: "HTTP & OpenAPI",
    question: "Ab welcher OpenAPI-Version steht type: mutualTLS nativ als securityScheme zur Verfügung?",
    options: ["Swagger 2.0", "OpenAPI 3.0.0", "OpenAPI 3.1.0", "Erst OpenAPI 4.0"],
    answer: 2,
    explain: "type: mutualTLS wurde mit OpenAPI 3.1.0 eingeführt."
  },
  {
    id: "q15",
    domain: "OAuth 2.1 & OIDC",
    question: "Welcher Endpunkt liefert dynamisch issuer, token_endpoint, userinfo_endpoint und jwks_uri?",
    options: [
      "/api/v3/openapi.json",
      "/.well-known/openid-configuration",
      "/soap?wsdl",
      "/status/200"
    ],
    answer: 1,
    explain: "OIDC Discovery stellt alle Identity-Provider-Endpunkte standardisiert unter /.well-known/openid-configuration bereit."
  }
];
