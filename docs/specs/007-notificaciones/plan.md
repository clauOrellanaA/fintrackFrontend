# Plan de notificaciones

Estado: propuesta frontend; no hay contrato de notificaciones implementado en este repositorio. Base: `6f4679e62dac6bfd067ca4472413f5dccff8f39d`. Cubre RF-M5-04 y RF-N-01..05.

## Trazabilidad de historias e issues

FE-SDD-03, 2026-10-30. El issue del módulo agrupa sus historias y tareas; permanece abierto hasta acreditar la aceptación completa. Las capacidades y pruebas locales existentes conservan su evidencia.

| Historia | Requisitos | Tareas | Issue |
| --- | --- | --- | --- |
| [HU-N-01](spec.md#hu-n-01) | `RF-N-01`, `RF-N-02`, `RF-N-03`, `RF-N-05` | [T-N-01](tasks.md), [T-N-02](tasks.md), [T-N-03](tasks.md), [T-N-04](tasks.md), [T-N-05](tasks.md), [T-N-07](tasks.md), [T-N-08](tasks.md), [T-N-09](tasks.md), [T-N-10](tasks.md), [T-N-11](tasks.md), [T-N-12](tasks.md), [T-N-13](tasks.md), [T-N-14](tasks.md) | [#38](https://github.com/clauOrellanaA/fintrackFrontend/issues/38) |
| [HU-N-02](spec.md#hu-n-02) | `RF-N-04`, `RF-N-05` | [T-N-01](tasks.md), [T-N-02](tasks.md), [T-N-03](tasks.md), [T-N-06](tasks.md), [T-N-07](tasks.md), [T-N-08](tasks.md), [T-N-09](tasks.md), [T-N-10](tasks.md), [T-N-11](tasks.md), [T-N-12](tasks.md), [T-N-13](tasks.md), [T-N-14](tasks.md) | [#38](https://github.com/clauOrellanaA/fintrackFrontend/issues/38) |

El detalle de aceptación está en la [spec](spec.md); el estado de cada tarea se conserva en [tasks.md](tasks.md). Un enlace o un issue cerrado no sustituye los resultados por RF.

## Estructura propuesta

| Parte | Responsabilidad | RF |
| --- | --- | --- |
| `src/features/notifications/api/contract.ts` | Esquema de respuesta y tipos propios | N-01..05 |
| `api/notifications.ts` | Transporte autenticado, listar y confirmar lectura | N-01/04/05 |
| `hooks/useNotifications.ts` | Estado por token, cancelación, reintento y confirmación de lectura | N-01/04/05 |
| `NotificationsPage.tsx` y estilos de la feature | Lista, leído/no leído, carga, error y vacío | N-01..05 |
| `src/app/App.tsx`, `AppShell.tsx` | Ruta /notifications y navegación | N-01 |
| Tests de contrato/hook/página y E2E | Comprobar límites y privacidad local | N-01..05 |

IDs abreviados N-* en este plan equivalen a RF-N-*. Cada archivo tendrá un único escritor durante la implementación.

## Contrato propuesto para entregar a otra sesión

Rutas relativas a la misma base configurada; Bearer requerido; sin `userId` del cliente. No empezar a consumirlas hasta disponer de confirmación del servicio.

| Operación | Request | Respuesta satisfactoria | RF |
| --- | --- | --- | --- |
| GET notifications?cursor=…&limit=20 | cursor opcional opaco, límite fijo 20 | 200 con items y nextCursor | N-01/02/03/05 |
| PATCH notifications/:id | { "read": true } | 200 con aviso completo; repetir conserva readAt | N-04/05 |

Ejemplo JSON propuesto (datos sintéticos):
```json
{
  "items": [{
    "id": "d9d3f59d-589e-47f5-8521-6727b9a0a291",
    "type": "budget_warning",
    "message": "Tu presupuesto de alimentación alcanzó el 80 %.",
    "createdAt": "2026-10-29T12:00:00-04:00",
    "readAt": null,
    "resource": {
      "kind": "budget",
      "id": "bb631301-8f63-4cd3-aa0e-9df7d9d86b9e",
      "month": "2026-10"
    }
  }],
  "nextCursor": null
}
```

Tipos: budget_warning, budget_exceeded, goal_completed, goal_overdue. UUID, timestamp ISO con zona; resource.kind budget/goal; month requerido solo para presupuesto. Aviso leído tiene readAt timestamp; al marcar lectura se devuelve ese objeto, sin envoltura items. Orden createdAt descendente e id como desempate estable; cursor opaco; “Cargar más” cuando exista nextCursor. Campos de texto son texto plano, nunca HTML. No se transporta dinero; cualquier ampliación monetaria mantendrá BOB y cadenas decimales con dos posiciones.

Errores propuestos: 400/422 para cursor/entrada inválida; 401 para sesión inválida; 404 para ID inexistente o de otro usuario, sin revelar propiedad; 5xx para fallo interno. El frontend usa mensajes propios y el cliente HTTP actual (timeout/red/esquema inválido). Consulta fallida conserva estado de error; no equivale a items=[].

## Generación y persistencia: dependencia externa

RF-N-02/03: el servicio genera eventos a partir de estados financieros autoritativos. Deduplica con clave (usuario, presupuesto, mes, tipo) o (usuario, meta, tipo), incluso con concurrencia y repetición. Salto directo a exceso no genera atención nueva. No reemitir por descender y volver al mismo umbral; no modificar avisos históricos. Metas archivadas no generan eventos nuevos; metas completadas no generan vencimiento nuevo. Corte diario America/La_Paz. Sin backfill anterior a activación.

El mecanismo de generación y el almacenamiento corresponden a otra sesión. Aceptación externa: generación aunque la bandeja esté cerrada, persistencia tras reinicio, lectura idempotente, deduplicación concurrente y acceso cruzado rechazado. No puede acreditarse con mocks.

## Decisiones y alternativa

- Reutilizar React/TypeScript, cliente HTTP, sesión y Zod existentes: reduce mantenimiento. Descartado un segundo transporte o librería de estado sin necesidad.
- Bandeja persistida en API: conserva lectura entre sesiones. Descartado localStorage porque no representa propiedad ni historial autoritativo.
- Entrar/actualizar manualmente y paginar 20: trabajo pequeño y carga acotada. Descartado polling/websocket para este MVP.
- Mostrar estado confirmado por API; sin confirmación optimista de lectura: evita anunciar éxito ante fallo. Descartado calcular alertas desde porcentajes redondeados del panel.

## Estrategia de tests

RF-N-01: lista/vacío/carga, orden recibido y página siguiente; N-02/03: representación de cada tipo y mensajes. Los umbrales y deduplicación se prueban en el servicio, con evidencia entregada externamente. N-04: lectura confirmada, repetida y fallida. N-05: 401, red/timeout, payload inválido, cambio de usuario y respuesta tardía. E2E controlado de teclado y móvil/escritorio. API real aislada con dos cuentas prueba lectura persistente y rechazo de ID ajeno. Todos estos tests están por escribir y ejecutar.
