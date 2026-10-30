# Tareas pendientes M6
Cobertura y contraste sobre flujos presentes; no implica reconstruir autenticación.

- [ ] **M6-T1 · Contrastar compatibilidad de perfil antiguo** · 20 min · RF-M6-02 · Depende: esquema actual y confirmación documental de la sesión del servicio.
  Hecho cuando: el caso displayName null/vacío tiene decisión y evidencia enlazadas; se distingue el required actual de la permisividad descrita en integración, sin alterar código por suposición.
- [x] **M6-T2 · Cubrir errores y confirmación de contraseña** · 25 min · RF-M6-02/03 · Depende: M6-T1 y fixtures sintéticos.
  Hecho cuando: pruebas verifican correo/fecha en conflicto, confirmación distinta, nueva contraseña fuera de longitud y contraseña actual rechazada sin presentar éxito.
- [x] **M6-T3 · Cubrir cierre y expiración de acceso** · 25 min · RF-M6-01/04 · Depende: fixtures de sesión.
  Hecho cuando: pruebas comprueban cierre local inmediato ante fallo remoto, vencimiento temporal, recarga sin sesión persistida y respuesta de acceso antigua que no reemplaza la vigente.
- [x] **M6-T4 · Registrar cobertura local por RF** · 20 min · RF-M6-01/02/03/04 · Depende: M6-T2/T3.
  Hecho cuando: se ejecutan pruebas de cuenta/sesión y se registra SHA, comando, resultado y aceptación aún no cubierta.
- [ ] **M6-T5 · Preparar traspaso de seguridad externa** · 20 min · RF-M6-03/04 · Depende: M6-T4.
  Hecho cuando: la sesión del servicio recibe casos verificables de hash seguro, revocación de todas las sesiones y rechazo de lectura/escritura sobre recursos ajenos; sin credenciales en documentos.
- [ ] **M6-T6 · Contrastar dos cuentas sintéticas** · 30 min · RF-M6-01/02/03/04 · Depende: M6-T5, API aislada y datos proporcionados por su operador.
  Hecho cuando: se registra acceso/edición/cambio de contraseña y respuesta a operaciones cruzadas; evidencias externas de hash y persistencia se enlazan, o se mantiene el cierre de seguridad pendiente.

Actualización FE-SDD-02 (2026-10-30): checks locales aprobados, Vitest 98/98 y Playwright 24/24. Véase [evidencia por RF](../../sdd/verification.md). Las casillas abiertas requieren evidencia externa o funcionalidad todavía pendiente.
M6-T1: compatibilidad del PATCH parcial probada localmente, pendiente confirmación del servicio. M6-T5: [traspaso preparado](../../sdd/service-handoff.md), pendiente recepción en la sesión del servicio.

## Relación de tareas, historias e issue

Los estados y criterios anteriores se conservan; esta tabla aporta trazabilidad sin acreditar trabajo adicional. El [plan](plan.md#trazabilidad-de-historias-e-issues) relaciona cada historia con sus RF.

| Tarea | Historias | Issue |
| --- | --- | --- |
| `M6-T1` | [HU-M6-02](spec.md#hu-m6-02) | [#37](https://github.com/clauOrellanaA/fintrackFrontend/issues/37) |
| `M6-T2` | [HU-M6-02](spec.md#hu-m6-02) | [#37](https://github.com/clauOrellanaA/fintrackFrontend/issues/37) |
| `M6-T3` | [HU-M6-01](spec.md#hu-m6-01), [HU-M6-03](spec.md#hu-m6-03) | [#37](https://github.com/clauOrellanaA/fintrackFrontend/issues/37) |
| `M6-T4` | [HU-M6-01](spec.md#hu-m6-01), [HU-M6-02](spec.md#hu-m6-02), [HU-M6-03](spec.md#hu-m6-03) | [#37](https://github.com/clauOrellanaA/fintrackFrontend/issues/37) |
| `M6-T5` | [HU-M6-02](spec.md#hu-m6-02), [HU-M6-03](spec.md#hu-m6-03) | [#37](https://github.com/clauOrellanaA/fintrackFrontend/issues/37) |
| `M6-T6` | [HU-M6-01](spec.md#hu-m6-01), [HU-M6-02](spec.md#hu-m6-02), [HU-M6-03](spec.md#hu-m6-03) | [#37](https://github.com/clauOrellanaA/fintrackFrontend/issues/37) |
