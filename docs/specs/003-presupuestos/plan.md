# Plan M3 · Gestión de presupuestos
Estado: reconstrucción técnica del frontend existente; no reconstruir la gestión.
Base auditada: 6f4679e; fecha: 2026-10-29.

## Trazabilidad de historias e issues

FE-SDD-03, 2026-10-30. El issue del módulo agrupa sus historias y tareas; permanece abierto hasta acreditar la aceptación completa. Las capacidades y pruebas locales existentes conservan su evidencia.

| Historia | Requisitos | Tareas | Issue |
| --- | --- | --- | --- |
| [HU-M3-01](spec.md#hu-m3-01) | `RF-M3-01`, `RF-M3-02` | [M3-T1](tasks.md), [M3-T3](tasks.md), [M3-T4](tasks.md), [M3-T5](tasks.md) | [#33](https://github.com/clauOrellanaA/fintrackFrontend/issues/33) |
| [HU-M3-02](spec.md#hu-m3-02) | `RF-M3-03`, `RF-M3-04` | [M3-T2](tasks.md), [M3-T3](tasks.md), [M3-T4](tasks.md), [M3-T5](tasks.md) | [#33](https://github.com/clauOrellanaA/fintrackFrontend/issues/33) |

El detalle de aceptación está en la [spec](spec.md); el estado de cada tarea se conserva en [tasks.md](tasks.md). Un enlace o un issue cerrado no sustituye los resultados por RF.

## Estructura existente y RF
- `src/features/budgets/BudgetsPage.tsx`: mes, listado, alta/edición y confirmación de eliminación; RF-M3-01/02.
- `BudgetCard` dentro de esa página: importes, progreso, estados y avisos; RF-M3-03/04.
- `hooks/useBudgets.ts`: consulta por sesión/mes y mutaciones; todos los RF.
- `api/contract.ts` y `api/budgets.ts`: esquemas y transporte; todos los RF.
- `transactions/hooks/useCategories.ts`: categorías para asignación; RF-M3-02.
- `dashboard/components/BudgetIndicators.tsx`: lectura de indicadores en panel; RF-M3-03/04, relacionado con RF-M1-04.

## Contrato consumido y datos
- `GET budgets?month=YYYY-MM`, Bearer: lista de id, categoryId/categoryName, limit, spent, remaining, progress y state.
- `POST budgets`: categoryId, month, limit; RF-M3-01/02.
- `PATCH budgets/:id`: solo limit; categoría/mes no se editan; RF-M3-01/02.
- `DELETE budgets/:id`: éxito sin cuerpo utilizado; no modifica movimientos; RF-M3-01.
- Importes BOB como cadenas exactas de dos decimales; creación exige límite positivo.
- Mes inicial de America/La_Paz; el estado recibido es normal/warning/exceeded.
- Muestra restante negativo como exceso y porcentaje textual real; barra contenida al 100 %; RF-M3-03.
- Ejemplos existentes: 80 y 100 % warning; 100,01 % exceeded. Clasificación autoritativa del servicio; RF-M3-04.
- 409 informa duplicado categoría/mes; sin categorías no habilita crear; RF-M3-02.
- Persistencia, exclusividad categoría/mes y cálculo de consumo se verifican externamente.

## Decisiones y alternativa
- Mantener límites por categoría, no añadir límite global inexistente; alternativa descartada: ampliar alcance mientras se documenta.
- Mantener mensajes inline según state; alternativa descartada: llamarlos bandeja persistente.
- Conservar estado calculado por API; alternativa descartada: derivar alertas comparando porcentajes en frontend.

## Estrategia de comprobación
- RF-M3-01/02: `BudgetsPage.test.tsx`, test de crear/editar/eliminar; `hooks/useBudgets.test.tsx`, payloads por mes.
- RF-M3-03/04: `dashboard/components/BudgetIndicators.test.tsx`, 80/100/>100 y vacío/no disponible.
- Falta comprobar 79,99 %, conflictos, categorías ausentes/fallidas y errores en la pantalla de gestión.
- Faltan comprobaciones explícitas de cambio rápido de mes/sesión en gestión.
- Candidato: `npm test`; NO ejecutado en esta auditoría.
- No existe E2E específico de gestión de presupuestos en esta base.

## Pendiente y cierre
Consultar [tareas](tasks.md); los tests controlados de estados no prueban cálculo financiero.
Las notificaciones persistentes se planifican aparte en [007](../007-notificaciones/plan.md).
