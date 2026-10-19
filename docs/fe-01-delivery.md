# FE-01: tarjeta de saldo disponible

La tarjeta consume `sections.balance` del contrato `dashboard.v1.json` recibido en FE-00. Muestra exclusivamente el importe y el corte entregados por backend; no calcula ni reconstruye el saldo en el navegador.

El formateador de BOB trabaja sobre la cadena decimal del contrato, conserva los dos decimales y agrupa la parte entera sin usar `Number`. Cubre cero, importes negativos y el máximo `999999999999.99`. Cuando la sección responde `notAvailable`, la tarjeta comunica la indisponibilidad sin sustituirla por `0.00`.

Se ejecutaron `npm test` (19 pruebas), `npm run lint`, `npm run typecheck` y `npm run build`. La validación visual con navegador y la integración real API/PostgreSQL continúan pendientes de FE-06; no se usaron valores simulados como fallback de producto.
