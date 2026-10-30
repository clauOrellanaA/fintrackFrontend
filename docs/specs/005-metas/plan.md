# Plan M5 · Metas de ahorro y alertas
Estado: gestión presente en la base; cobertura de gestión y notificaciones pendientes.
Base auditada: 6f4679e; fecha: 2026-10-29.

## Trazabilidad de historias e issues

FE-SDD-03, 2026-10-30. El issue del módulo agrupa sus historias y tareas; permanece abierto hasta acreditar la aceptación completa. Las capacidades y pruebas locales existentes conservan su evidencia.

| Historia | Requisitos | Tareas | Issue |
| --- | --- | --- | --- |
| [HU-M5-01](spec.md#hu-m5-01) | `RF-M5-01`, `RF-M5-02` | [M5-T1](tasks.md), [M5-T2](tasks.md), [M5-T4](tasks.md), [M5-T5](tasks.md), [M5-T6](tasks.md), [M5-T7](tasks.md) | [#35](https://github.com/clauOrellanaA/fintrackFrontend/issues/35) |
| [HU-M5-02](spec.md#hu-m5-02) | `RF-M5-03` | [M5-T1](tasks.md), [M5-T3](tasks.md), [M5-T4](tasks.md), [M5-T5](tasks.md), [M5-T6](tasks.md), [M5-T7](tasks.md) | [#35](https://github.com/clauOrellanaA/fintrackFrontend/issues/35) |
| [HU-M5-03](spec.md#hu-m5-03) | `RF-M5-04` | [M5-T8](tasks.md) | [#35](https://github.com/clauOrellanaA/fintrackFrontend/issues/35); depende de [#38](https://github.com/clauOrellanaA/fintrackFrontend/issues/38) |

El detalle de aceptación está en la [spec](spec.md); el estado de cada tarea se conserva en [tasks.md](tasks.md). Un enlace o un issue cerrado no sustituye los resultados por RF.

## Estructura existente y RF
- `src/features/savings-goals/SavingsGoalsPage.tsx`: lista, formularios, tarjetas y archivo/restauración; RF-M5-01/02/03.
- `hooks/useSavingsGoals.ts`: consulta por token, descarte de lectura obsoleta y mutaciones con recarga; RF-M5-01/03.
- `api/contract.ts`, `api/savingsGoals.ts`: esquemas y solicitudes; RF-M5-01/02/03.
- Ruta `/savings-goals` en `src/app/App.tsx`; navegación autenticada en AppShell.
- `dashboard/components/SavingsGoalsCard.tsx`: indicadores de lectura; no sustituye gestión.
- No existe implementación de bandeja ni API de notificaciones; RF-M5-04 pendiente.

## Contrato consumido y datos
- `GET savings-goals`: lista incluyendo archivadas; RF-M5-01/03.
- `POST savings-goals`: name, target, targetDate nullable; RF-M5-01/02.
- `PATCH savings-goals/:id`: name/target/targetDate/archived; RF-M5-01/02.
- `POST savings-goals/:id/entries`: type contribution/withdrawal y amount; RF-M5-03.
- Devuelve entry con id/type/amount/currency/occurredAt y goal actualizado.
- Meta: id, name, target, saved, remaining, progress, state, targetDate, archived, createdAt y currency BOB.
- Estados active/completed/overdue provienen del servicio; objetivo y aportes/retiros positivos de dos decimales.
- Nombre recortado de 1–100; fecha opcional calendario, sin cambiar día al formatear.
- Archivadas siguen visibles y editables; no ofrecen aportar/retirar. No existe borrado destructivo.
- Retiros que superan acumulado se rechazan externamente; la UI comunica conflicto, no calcula reservas.
- Persistencia append-only y efecto de reservas en saldo son dependencias externas, no certificados por el cliente.

## Decisiones y alternativa
- Mantener archivo/restauración; alternativa descartada: borrado irreversible no expuesto por contrato.
- Mantener ledger administrado por API; alternativa descartada: editar un acumulado localmente.
- Mantener indicadores inline; alternativa descartada: tratarlos como notificaciones persistentes ya implementadas.
- RF-M5-04 se desarrolla mediante [plan 007](../007-notificaciones/plan.md), según [roadmap](../../sdd/roadmap.md), sin duplicar tareas de implementación aquí.

## Estrategia de comprobación
- No hay tests propios bajo `savings-goals` ni E2E de gestión en esta base.
- `dashboard/components/SavingsGoalsCard.test.tsx` cubre lectura de estados/valores en panel; no cubre RF-M5-01 ni mutaciones de RF-M5-03.
- Añadir tests de formulario, operaciones, archivo, errores, 401 y cambios de sesión; RF-M5-01/02/03.
- Candidato: `npm test`; NO ejecutado en esta auditoría.
- Integración real necesita API aislada, datos sintéticos y validación externa de aportes/retiros/persistencia.

## Pendiente y cierre
Consultar [tareas](tasks.md). El módulo global permanece pendiente por RF-M5-04 y evidencia integrada.
