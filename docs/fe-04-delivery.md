# FE-04: indicadores de presupuestos

La vista consume `sections.budgets` del contrato y representa categoría, límite, gastado, restante, progreso y estado. Los estados `normal`, `warning` y `exceeded` se reciben del backend: la interfaz no redefine sus umbrales.

Las barras de progreso se limitan visualmente al 100 % para no desbordar el componente, mientras la etiqueta conserva el progreso real, incluso por encima de 100 %. Los importes BOB se formatean sin convertirlos a `Number`; una lista vacía y `notAvailable` se presentan como estados distintos.

Se ejecutaron `npm test` (25 pruebas), `npm run lint`, `npm run typecheck` y `npm run build`. La integración real API/PostgreSQL y la revisión visual con navegador permanecen pendientes de FE-06.
