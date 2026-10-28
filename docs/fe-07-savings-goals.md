# FE-07 · Metas de ahorro

La pantalla `/savings-goals` completa el flujo de metas de ahorro sobre la API autenticada del backend.

## Capacidades

- listar metas activas, completadas, vencidas y archivadas;
- crear y editar nombre, objetivo y fecha objetivo;
- registrar aportes y retiros mediante el ledger append-only;
- archivar o restaurar una meta sin borrar sus reservas;
- mostrar estados de carga, error, sesión vencida y formularios accesibles.

## Contrato

El cliente valida las respuestas con Zod en `src/features/savings-goals/api/contract.ts`. La implementación HTTP está en `api/savingsGoals.ts` y la carga/mutación aislada por sesión en `hooks/useSavingsGoals.ts`.

La pantalla no modifica directamente el dashboard: el indicador existente conserva su contrato BE-06 y la página de gestión consume `GET /savings-goals`, `POST /savings-goals`, `PATCH /savings-goals/:id` y `POST /savings-goals/:id/entries`.

## Validaciones de interfaz

Los importes se envían como cadenas BOB con dos decimales. La fecha es opcional. Un retiro debe ser positivo y el backend rechaza retiros que dejarían el acumulado negativo. No se ofrece un botón de eliminación destructiva.
