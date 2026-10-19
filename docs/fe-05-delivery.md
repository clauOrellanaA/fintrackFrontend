# FE-05: indicadores de metas de ahorro

La tarjeta consume `sections.savingsGoals` y presenta nombre, objetivo, acumulado, restante, progreso, estado y fecha objetivo solo cuando el contrato la entrega. Los estados `active`, `completed` y `overdue` se representan como información recibida del backend.

El progreso se limita visualmente al 100 % para conservar el diseño, mientras su etiqueta mantiene el valor real cuando supera el objetivo. Los valores BOB se formatean como cadenas exactas; la interfaz no recalcula aportes, retiros ni el efecto de las metas sobre el saldo. Lista vacía y `notAvailable` son estados distintos.

Se ejecutaron `npm test` (27 pruebas), `npm run lint`, `npm run typecheck` y `npm run build`. La integración real API/PostgreSQL y la revisión visual con navegador permanecen pendientes de FE-06.
