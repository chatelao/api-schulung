# Musterlösung M04: Assertions, Request-Chaining & Mocking

## Lösung Aufgabe A: Bruno Desktop Collection Runner
- Im **Assert-Tab** von `03-get-pet-by-id` wird `res.body.status` `eq` `available` ergänzt.
- Da `01-create-pet` die ID mit `bru.setVar("petId", ...)` flüchtig im Arbeitsspeicher ablegt, bleiben die gespeicherten Environment-Dateien (`environments/local.yml`) sauber unverändert.

## Lösung Aufgabe B: SoapUI `Property Transfer` & `XPath Match`
In [collections/soapui/order-service-soapui-project.xml](../collections/soapui/order-service-soapui-project.xml) ist der TestCase `OrderChainingTestCase` vollständig konfiguriert:
- **Source XPath (`CreateOrder`):**
  ```xpath
  declare namespace tns='http://api-schulung.local/orders/v1';
  //tns:CreateOrderResponse/tns:orderId
  ```
- **Target XPath (`GetOrder`):**
  ```xpath
  declare namespace tns='http://api-schulung.local/orders/v1';
  //tns:GetOrderRequest/tns:orderId
  ```

## Lösung Aufgabe C: SoapUI MockService
- Nach Start von `OrderServiceMock` antwortet `http://localhost:8088/mockOrderService` auf `CalculateTax` unabhängig vom Docker-Container mit `taxRate=0.081`, `taxAmount=16.20`, `grossAmount=216.20`.

## Lösung Bonus-Challenge D: Data-Driven Testing (Bruno vs. SoapUI OS)
- **Bruno Desktop:** Im Collection Runner *Select Data File → CSV* wählen; Felder stehen direkt als `{{petId}}` / `{{petName}}` bereit.
- **SoapUI Open Source 5.10.1:** Unterstützt **keinen** codelosen Excel-/CSV-`DataSource`-TestStep (dieses Feature gehört zu **ReadyAPI**).

*(Für automatisierte `bru run`-CI-Läufe siehe [Advanced A06](../advanced/A06-token-lifecycle-bruno-cli-cicd.md).)*
