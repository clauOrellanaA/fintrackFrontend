# Tareas pendientes de notificaciones

Implementación sin iniciar: contrato no confirmado. FE-SDD-02 preparó el traspaso externo sin consumir rutas propuestas. IDs T-N; 20–30 minutos por tarea local. Duraciones no incluyen esperas por la dependencia externa ni garantizan su disponibilidad.

- [ ] T-N-01 (20 min) — Entregar y registrar aceptación o cambios del contrato propuesto. RF: RF-N-01..05, RF-M5-04. Depende de: revisión de spec/plan.
  Hecho cuando: una respuesta de la sesión del servicio confirma rutas, ejemplos, errores, generación, persistencia y deduplicación o registra cambios concretos.
- [ ] T-N-02 (25 min) — Escribir tests del esquema para lista/aviso y lectura. RF: RF-N-01/04/05. Depende de: T-N-01.
  Hecho cuando: tests identificados cubren fixture válido, fechas/UUID/tipo inválidos y readAt nulo/presente y fallan por implementación ausente.
- [ ] T-N-03 (25 min) — Implementar esquema y cliente HTTP acordados. RF: RF-N-01/04/05. Depende de: T-N-02.
  Hecho cuando: tests anteriores pasan, requests llevan Bearer y no envían identidad de usuario.
- [ ] T-N-04 (30 min) — Escribir tests de consulta del hook. RF: RF-N-01/05. Depende de: T-N-03.
  Hecho cuando: tests cubren carga, vacío, error/reintento, 401, cambio de token y respuesta tardía; se registra el resultado previo a implementar.
- [ ] T-N-05 (30 min) — Implementar consulta, paginación y limpieza por sesión. RF: RF-N-01/05. Depende de: T-N-04.
  Hecho cuando: tests del hook pasan y páginas de un usuario no se reutilizan con otro.
- [ ] T-N-06 (25 min) — Escribir tests y después implementar confirmación de lectura en el hook. RF: RF-N-04/05. Depende de: T-N-05.
  Hecho cuando: éxito usa readAt devuelto, repetición no duplica y fallo no muestra leído; prueba escrita antes del cambio correspondiente.
- [ ] T-N-07 (25 min) — Escribir tests de lista y estados de la página. RF: RF-N-01/02/03/05. Depende de: T-N-05.
  Hecho cuando: casos cubren los cuatro tipos, carga/vacío/error, reintento y cargar más; fallos iniciales registrados.
- [ ] T-N-08 (30 min) — Crear la página y estilos reutilizando componentes actuales. RF: RF-N-01/02/03/05. Depende de: T-N-07.
  Hecho cuando: pruebas de lista pasan y avisos tienen texto, fecha y estado legibles sin depender solo del color.
- [ ] T-N-09 (25 min) — Incorporar acción de lectura, ruta y navegación. RF: RF-N-01/04/05. Depende de: T-N-06/08.
  Hecho cuando: pruebas de interacción escritas primero pasan y acceso sin sesión vuelve al formulario.
- [ ] T-N-10 (30 min) — Añadir aceptación E2E controlada. RF: RF-N-01..05. Depende de: T-N-09.
  Hecho cuando: teclado, estados y viewport móvil/escritorio pasan con fixtures identificados; no se declara API real.
- [ ] T-N-11 (25 min) — Ejecutar checks locales y registrar evidencia por RF. RF: RF-N-01..05. Depende de: T-N-10.
  Hecho cuando: lint, typecheck, tests, build y E2E tienen comando/resultado/SHA; cualquier fallo queda abierto.
- [ ] T-N-12 (20 min) — Recibir evidencia externa de eventos y seguridad. RF: RF-N-02/03/05. Depende de: servicio aislado disponible.
  Hecho cuando: otra sesión aporta generación sin bandeja, umbrales, vencimiento diario, deduplicación, persistencia y rechazo cruzado con resultados.
- [ ] T-N-13 (30 min) — Ejecutar escenario real de consulta y lectura. RF: RF-N-01/04/05, RF-M5-04. Depende de: T-N-11/12 y dos cuentas sintéticas.
  Hecho cuando: leer/reingresar conserva lectura, otra cuenta no obtiene el aviso y se registra evidencia real sin secretos.
- [ ] T-N-14 (20 min) — Actualizar spec, inventario y verificación. RF: RF-N-01..05, RF-M5-04. Depende de: T-N-13.
  Hecho cuando: cada RF enlaza evidencia del alcance correcto y los pendientes reales continúan abiertos.

FE-SDD-02: [solicitud preparada para el servicio](../../sdd/service-handoff.md). T-N-01 sigue pendiente porque no se ha recibido confirmación del contrato; tampoco se presupone ejecución de las tareas dependientes.

## Relación de tareas, historias e issue

Los estados y criterios anteriores se conservan; esta tabla aporta trazabilidad sin acreditar trabajo adicional. El [plan](plan.md#trazabilidad-de-historias-e-issues) relaciona cada historia con sus RF.

| Tarea | Historias | Issue |
| --- | --- | --- |
| `T-N-01` | [HU-N-01](spec.md#hu-n-01), [HU-N-02](spec.md#hu-n-02) | [#38](https://github.com/clauOrellanaA/fintrackFrontend/issues/38) |
| `T-N-02` | [HU-N-01](spec.md#hu-n-01), [HU-N-02](spec.md#hu-n-02) | [#38](https://github.com/clauOrellanaA/fintrackFrontend/issues/38) |
| `T-N-03` | [HU-N-01](spec.md#hu-n-01), [HU-N-02](spec.md#hu-n-02) | [#38](https://github.com/clauOrellanaA/fintrackFrontend/issues/38) |
| `T-N-04` | [HU-N-01](spec.md#hu-n-01) | [#38](https://github.com/clauOrellanaA/fintrackFrontend/issues/38) |
| `T-N-05` | [HU-N-01](spec.md#hu-n-01) | [#38](https://github.com/clauOrellanaA/fintrackFrontend/issues/38) |
| `T-N-06` | [HU-N-02](spec.md#hu-n-02) | [#38](https://github.com/clauOrellanaA/fintrackFrontend/issues/38) |
| `T-N-07` | [HU-N-01](spec.md#hu-n-01), [HU-N-02](spec.md#hu-n-02) | [#38](https://github.com/clauOrellanaA/fintrackFrontend/issues/38) |
| `T-N-08` | [HU-N-01](spec.md#hu-n-01), [HU-N-02](spec.md#hu-n-02) | [#38](https://github.com/clauOrellanaA/fintrackFrontend/issues/38) |
| `T-N-09` | [HU-N-01](spec.md#hu-n-01), [HU-N-02](spec.md#hu-n-02) | [#38](https://github.com/clauOrellanaA/fintrackFrontend/issues/38) |
| `T-N-10` | [HU-N-01](spec.md#hu-n-01), [HU-N-02](spec.md#hu-n-02) | [#38](https://github.com/clauOrellanaA/fintrackFrontend/issues/38) |
| `T-N-11` | [HU-N-01](spec.md#hu-n-01), [HU-N-02](spec.md#hu-n-02) | [#38](https://github.com/clauOrellanaA/fintrackFrontend/issues/38) |
| `T-N-12` | [HU-N-01](spec.md#hu-n-01), [HU-N-02](spec.md#hu-n-02) | [#38](https://github.com/clauOrellanaA/fintrackFrontend/issues/38) |
| `T-N-13` | [HU-N-01](spec.md#hu-n-01), [HU-N-02](spec.md#hu-n-02) | [#38](https://github.com/clauOrellanaA/fintrackFrontend/issues/38) |
| `T-N-14` | [HU-N-01](spec.md#hu-n-01), [HU-N-02](spec.md#hu-n-02) | [#38](https://github.com/clauOrellanaA/fintrackFrontend/issues/38) |
