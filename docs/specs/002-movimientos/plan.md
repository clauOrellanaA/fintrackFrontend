# Plan M2 · Gestión de ingresos y gastos
Estado: reconstrucción técnica del frontend existente; quedan brechas de pruebas.
Base auditada: 6f4679e; fecha: 2026-10-29.

## Trazabilidad de historias e issues

FE-SDD-03, 2026-10-30. El issue del módulo agrupa sus historias y tareas; permanece abierto hasta acreditar la aceptación completa. Las capacidades y pruebas locales existentes conservan su evidencia.

| Historia | Requisitos | Tareas | Issue |
| --- | --- | --- | --- |
| [HU-M2-01](spec.md#hu-m2-01) | `RF-M2-01`, `RF-M2-03` | [M2-T1](tasks.md), [M2-T4](tasks.md), [M2-T6](tasks.md), [M2-T7](tasks.md) | [#32](https://github.com/clauOrellanaA/fintrackFrontend/issues/32) |
| [HU-M2-02](spec.md#hu-m2-02) | `RF-M2-04` | [M2-T2](tasks.md), [M2-T3](tasks.md), [M2-T6](tasks.md), [M2-T7](tasks.md) | [#32](https://github.com/clauOrellanaA/fintrackFrontend/issues/32) |
| [HU-M2-03](spec.md#hu-m2-03) | `RF-M2-02` | [M2-T5](tasks.md), [M2-T6](tasks.md), [M2-T7](tasks.md) | [#32](https://github.com/clauOrellanaA/fintrackFrontend/issues/32) |

El detalle de aceptación está en la [spec](spec.md); el estado de cada tarea se conserva en [tasks.md](tasks.md). Un enlace o un issue cerrado no sustituye los resultados por RF.

## Estructura existente y RF
- `src/features/transactions/TransactionsPage.tsx`: formulario, listado, filtros, categorías y confirmaciones; RF-M2-01 a RF-M2-04.
- `hooks/useTransactions.ts`: resultados por token/filtros y descarte de respuestas obsoletas; RF-M2-04.
- `hooks/useTransactionMutations.ts`: alta, edición, anulación y recarga; RF-M2-01/03.
- `hooks/useCategories.ts`: catálogo privado y mutaciones; RF-M2-02.
- `api/contract.ts`, `api/transactions.ts`: validación y solicitudes; todos los RF.

## Contrato consumido y datos
- `GET transactions?status=posted&page=1&pageSize=10`: admite from/to, type y q; RF-M2-04.
- Respuesta paginada: items, page, pageSize, totalItems y totalPages.
- Cada movimiento: id, type income/expense, amount, currency BOB, categoryId/categoryName nullable, occurredAt, description nullable y status posted/void.
- `POST transactions` y `PATCH transactions/:id`: type, amount, categoryId, occurredAt y description; RF-M2-01/03.
- `DELETE transactions/:id`: anulación lógica, sin borrado físico; RF-M2-01.
- `GET/POST categories`, `PATCH/DELETE categories/:id`: id/nombre; RF-M2-02.
- Todo requiere Bearer; no se envía userId. Propiedad y persistencia corresponden a la API.
- Importe positivo de dos decimales y máximo doce dígitos enteros; descripción hasta 500, recortada.
- Categoría opcional; eliminar una categoría no debe eliminar movimientos. 409 al vincular presupuesto se presenta como conflicto.
- Formulario usa hora de Bolivia; envía instante ISO. Desde = medianoche inicial; hasta = medianoche del día siguiente, exclusiva; RF-M2-03/04.
- Aplicar filtros reinicia página a 1; estado inicial posted; texto recortado; RF-M2-04.

## Decisiones y alternativa
- Conservar DELETE como anulación, según mensaje y contrato; alternativa descartada: interpretar eliminación como borrado irreversible.
- Conservar filtros explícitos con botón aplicar y paginación del servidor; alternativa descartada: cargar todo y filtrar en navegador.
- Conservar los hooks existentes; alternativa descartada: añadir gestor de caché para documentar un flujo ya operativo.

## Estrategia de comprobación
- RF-M2-01/03: `hooks/useTransactionMutations.test.ts`, test `creates, updates, and voids movements through authenticated API requests`.
- RF-M2-02: `hooks/useCategories.test.ts`, incluidos 401 y conflicto al eliminar.
- Faltan tests propios de `TransactionsPage` y `useTransactions`: formularios, filtros, fechas, paginación y respuestas tardías no están acreditados.
- Añadir pruebas de comportamiento a partir de estos RF antes de corregir cualquier defecto descubierto.
- Candidato: `npm test`; NO ejecutado en esta auditoría. No existe E2E de gestión de movimientos en esta base.
- Integración real: alta/edición/anulación y efecto en consulta/panel, con cuentas sintéticas y API aislada.

## Pendiente y cierre
La cobertura del hook de mutaciones no acredita todos los recorridos de interfaz.
Consultar [tareas](tasks.md); autorización, persistencia y alcance semántico de búsqueda requieren evidencia del servicio.
