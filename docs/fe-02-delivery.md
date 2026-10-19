# FE-02: resumen mensual de ingresos y gastos

La entrega representa `sections.monthlySummary` del contrato de dashboard. Presenta los totales brutos de ingresos y gastos por separado, junto con el mismo período `YYYY-MM` de la respuesta. No calcula ni presenta resultado neto.

Reutiliza el formateador exacto BOB de FE-01, por lo que no convierte importes a `Number`. Un mes exitoso sin movimientos mantiene los dos valores `0.00` y lo comunica explícitamente. `notAvailable` se conserva como indisponibilidad y no se sustituye por ceros.

Se ejecutaron `npm test` (21 pruebas), `npm run lint`, `npm run typecheck` y `npm run build`. La integración real API/PostgreSQL y la revisión visual con navegador quedan pendientes de FE-06.
