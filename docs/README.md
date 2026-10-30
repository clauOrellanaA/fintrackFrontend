# Documentación de FinanTrack

Punto de entrada de la documentación frontend. La línea base SDD refleja `6f4679e62dac6bfd067ca4472413f5dccff8f39d` (29 de octubre de 2026). FE-SDD-02 actualiza correcciones y cobertura sobre `e9e6bd4` más el diff del worktree, el 30 de octubre de 2026; consultar la verificación vigente.

| Consulta | Documento |
| --- | --- |
| Principios del proyecto | [Constitución](constitution.md) |
| Cómo trabajar con SDD sin cuestionario | [Flujo sencillo](sdd/workflow.md) |
| Qué existe y qué falta de la lista solicitada | [Inventario](sdd/inventory.md) |
| Orden de los próximos trabajos | [Roadmap](sdd/roadmap.md) |
| Evidencia y alcance de las comprobaciones | [Verificación](sdd/verification.md) |
| Panel principal | [Spec](specs/001-panel/spec.md) · [Plan](specs/001-panel/plan.md) · [Tareas](specs/001-panel/tasks.md) |
| Movimientos | [Spec](specs/002-movimientos/spec.md) · [Plan](specs/002-movimientos/plan.md) · [Tareas](specs/002-movimientos/tasks.md) |
| Presupuestos | [Spec](specs/003-presupuestos/spec.md) · [Plan](specs/003-presupuestos/plan.md) · [Tareas](specs/003-presupuestos/tasks.md) |
| Informes | [Spec](specs/004-informes/spec.md) · [Plan](specs/004-informes/plan.md) · [Tareas](specs/004-informes/tasks.md) |
| Metas y alertas | [Spec](specs/005-metas/spec.md) · [Plan](specs/005-metas/plan.md) · [Tareas](specs/005-metas/tasks.md) |
| Usuarios y seguridad | [Spec](specs/006-usuarios/spec.md) · [Plan](specs/006-usuarios/plan.md) · [Tareas](specs/006-usuarios/tasks.md) |
| Notificaciones pendientes | [Spec propuesta](specs/007-notificaciones/spec.md) · [Plan](specs/007-notificaciones/plan.md) · [Tareas](specs/007-notificaciones/tasks.md) |
| Traspaso pendiente al servicio | [Contrato propuesto y aceptación externa](sdd/service-handoff.md) |
| Reutilizar el formato | [Plantillas](sdd/templates.md) |
| Diseño y contrato actual | [Arquitectura](architecture.md) · [Integración](integration.md) · [Estilos](styles.md) |
| Trabajo y ejecución | [Contribución](../CONTRIBUTING.md) · [README del proyecto](../README.md) |

## Organización

`constitution.md` conserva seis reglas; `sdd/` reúne proceso, inventario y evidencia; `specs/NNN-tema/` contiene qué/por qué, cómo y tareas por módulo; `contracts/` conserva los contratos disponibles en este repositorio.

Los documentos `fe-*-delivery.md`, `fe-m02-hooks.md`, `fe-m03-budget-management.md`, `fe-04-reports.md` y `fe-07-savings-goals.md` conservan su ubicación como antecedentes. Sus resultados corresponden a sus propias fechas y commits. No se trasladan ni se duplican sus evidencias como resultados actuales.

Toda documentación nueva se incorpora en este índice. Las especificaciones describen el producto; los planes contienen archivos, tecnología y contratos. Los pendientes de otra capa se entregan a su sesión correspondiente.
