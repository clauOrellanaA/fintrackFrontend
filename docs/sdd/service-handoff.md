# Traspaso al servicio: notificaciones e integración de specs

Fecha: 2026-10-30. Entrega frontend FE-SDD-02; base `e9e6bd4d3c9a36c02d3e7e41cc58a9a2c5d01983`.

Este documento es una solicitud para una sesión del repositorio del servicio. No acredita cambios de servidor ni autoriza a esta sesión frontend a acceder a sus archivos. El contrato de notificaciones sigue siendo una propuesta; no se consume hasta recibir confirmación. Referencia: [plan 007](../specs/007-notificaciones/plan.md).

## Encargo para la sesión del servicio

> Revisa y confirma el contrato propuesto de notificaciones de FinanTrack para RF-M5-04 y RF-N-01..05. Implementa lo que falte en tu repositorio siguiendo sus instrucciones, sin modificar el frontend. Entrega contrato versionado con ruta o enlace accesible al equipo frontend, ejemplos de éxito/error y resultados de pruebas. Si el servicio ya tiene otro contrato, entrega ese contrato y detalla las diferencias antes de que el frontend lo consuma. Prepara un entorno aislado y dos cuentas sintéticas mediante configuración privada; no incluyas credenciales en documentación, mensajes ni variables VITE_*.

## Contrato que debe confirmarse o corregirse

Todas las rutas son relativas a la base API configurada, requieren Bearer y resuelven el propietario desde la sesión, sin `userId` enviado por el navegador.

| Operación | Entrada | Respuesta propuesta |
| --- | --- | --- |
| `GET notifications?limit=20&cursor=...` | Cursor opaco opcional, página de 20 | `200 { items: Notification[], nextCursor: string | null }` |
| `PATCH notifications/:id` | `{ "read": true }` | `200 Notification`; lectura idempotente, conserva `readAt` original |

Ejemplo sintético de `Notification`:

```json
{
  "id": "d9d3f59d-589e-47f5-8521-6727b9a0a291",
  "type": "budget_warning",
  "message": "Tu presupuesto de alimentación alcanzó el 80 %.",
  "createdAt": "2026-10-30T12:00:00-04:00",
  "readAt": null,
  "resource": {
    "kind": "budget",
    "id": "bb631301-8f63-4cd3-aa0e-9df7d9d86b9e",
    "month": "2026-10"
  }
}
```

Confirmar UUID, timestamps ISO con zona, tipos `budget_warning`, `budget_exceeded`, `goal_completed`, `goal_overdue`; `resource.kind` budget/goal y `month` solo para presupuesto. Textos planos; orden por `createdAt` descendente e ID como desempate estable; cursor opaco consistente con ese orden. Un aviso leído devuelve `readAt` no nulo. Sin dinero en el payload del MVP.

Errores a confirmar: 400/422 para entrada/cursor inválido; 401 para sesión inválida; 404 para ID inexistente o ajeno sin revelar propiedad; 5xx para fallo interno. Indicar el envoltorio de error real y política de caché. El cliente mantendrá mensajes propios y no mostrará cuerpos arbitrarios de error.

## Aceptación de eventos y persistencia

- Presupuesto al 80 % hasta 100 % inclusive: atención; por encima de 100 %: exceso. Un salto directo desde menos de 80 % a exceso genera solo exceso para ese cambio.
- Deduplicación concurrente por usuario/presupuesto/mes/tipo y por usuario/meta/tipo. Descender y volver al mismo umbral, editar o reabrir una meta no vuelve a emitir el mismo tipo en este MVP.
- Meta completada o vencida sin completar: evento correspondiente. Meta completada no produce vencimiento nuevo; archivada no produce eventos nuevos. Mantener avisos históricos.
- Fecha de Bolivia (`America/La_Paz`); generación independiente de abrir la bandeja; sin backfill anterior a activación.
- Consultar y marcar lectura con A, volver a iniciar sesión y comprobar conservación; reiniciar el servicio y comprobar persistencia.
- B no puede consultar ni modificar avisos de A; validar también las rutas por ID.
- Entregar pruebas de concurrencia, umbrales, vencimiento diario, idempotencia, persistencia y acceso cruzado. Mocks no sustituyen esa evidencia.

## Cuenta, seguridad y datos

Confirmar la compatibilidad de cuentas antiguas con `displayName: null`. El contrato frontend permite PATCH parcial: para conservar un nombre antiguo vacío se propone omitir `displayName` al actualizar los demás campos, sin enviar cadena vacía ni null. Confirmar también el comportamiento al intentar borrar un nombre ya asignado.

Solicitar evidencia externa de protección de contraseñas, revocación de todas las sesiones al cambiar contraseña, rechazo de lectura/escritura sobre recursos ajenos y persistencia de movimientos, anulaciones, presupuestos y entradas de metas. Los tests del navegador y los mocks solo acreditan el comportamiento del cliente.

## Entorno de integración que debe proporcionar el operador

API aislada, CORS para el origen frontend de pruebas y dos cuentas sintéticas distintas con datos representativos. Nunca usar producción ni migrar o limpiar la base del usuario desde el frontend.

El runner actual de lectura del panel requiere `FINTRACK_TEST_API_URL`, `FINTRACK_TEST_MONTH`, `FINTRACK_TEST_EMAIL_A`, `FINTRACK_TEST_EMAIL_B`, `FINTRACK_TEST_PASSWORD_A` y `FINTRACK_TEST_PASSWORD_B`. Configurarlas mediante el entorno privado del runner; no guardar ni copiar sus valores a este documento. Ejecutar `npm run test:e2e:real` solo después de confirmar el aislamiento y la configuración. Ese runner cubre únicamente lectura del panel: gestión, notificaciones y seguridad necesitan recorridos adicionales una vez disponible el servicio.

En FE-SDD-02 se comprobó únicamente la presencia de esas seis variables en el proceso: todas ausentes. No se consultó la API real ni se afirma que el servicio esté caído.

## Respuesta necesaria para desbloquear frontend

1. Ruta o enlace al contrato confirmado, versión y diferencias respecto de la propuesta.
2. Ejemplos sintéticos válidos de lista, página siguiente, aviso leído y errores.
3. Resultados de aceptación de generación, propiedad, deduplicación y persistencia.
4. Confirmación de entorno aislado y nombres o ubicación privada de configuración; sin secretos en la respuesta.
5. Confirmación de compatibilidad del PATCH parcial de perfil antiguo.

Hasta recibir esa respuesta, implementación de notificaciones, RF-M5-04, RF-N-* y cierre de integración/seguridad siguen pendientes. La preparación de este traspaso no equivale a que la sesión del servicio lo haya recibido o ejecutado.
