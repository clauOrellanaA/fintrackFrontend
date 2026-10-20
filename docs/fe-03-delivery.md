# FE-03: distribución mensual de gastos

La distribución consume `sections.expenseDistribution` y conserva el orden, importes y porcentajes entregados por backend. El gráfico se implementa con barras CSS nativas y tokens ya existentes; no incorpora una dependencia de gráficos ni recalcula porcentajes.

Cada barra se acompaña de una alternativa textual visible: categoría, importe BOB exacto y porcentaje del gasto mensual. Los nombres largos pueden envolver texto sin causar desbordamiento. Una lista vacía muestra un período sin gastos y `notAvailable` conserva su significado, sin crear segmentos ni valores ficticios.

Se ejecutaron `npm test` (23 pruebas), `npm run lint`, `npm run typecheck` y `npm run build`. La integración real API/PostgreSQL y la revisión visual con navegador permanecen pendientes de FE-06.
