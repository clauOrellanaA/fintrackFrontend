# Plan de trabajo pendiente

No se planifica reconstruir capacidades presentes. Orden recomendado: cobertura local → contrato de notificaciones → interfaz de notificaciones → validación integrada. Estas tareas quedan por ejecutar; esta entrega redacta documentación.

| Orden | Entrega | RF | Dependencia | Aceptación |
| --- | --- | --- | --- | --- |
| 1 | Cubrir gestión de metas | RF-M5-01/02/03 | Código actual | Tests de crear/editar/aportar/retirar/archivar, errores y cambio de sesión |
| 2 | Completar cobertura de movimientos y límites | RF-M2-01/03/04, RF-M3-04 | Fixtures controlados | Pruebas de UI, filtros/fechas y 79.99/80/100/>100 sin recomputar estados financieros |
| 3 | Contrastar perfil y ampliar seguridad verificable | RF-M6-02/03/04 | Contrato externo de cuenta | Decisión documentada sobre nombre, pruebas de sesión y evidencia externa separada |
| 4 | Acordar contrato de notificaciones | RF-M5-04, RF-N-01..05 | Sesión del servicio correspondiente | Ejemplos, errores, propiedad, deduplicación y persistencia confirmados |
| 5 | Construir bandeja de notificaciones | RF-M5-04, RF-N-01..05 | Contrato anterior disponible | Listar, diferenciar leídas, marcar lectura, vacíos/error/reintento y limpieza de sesión |
| 6 | Cerrar integración de los seis módulos | Todos RF de cada flujo | API aislada y cuentas sintéticas | Resultados reales por RF sin usar producción ni administrar otra capa aquí |

Detalles de tareas de 20–30 minutos: `docs/specs/001-panel/tasks.md` a `007-notificaciones/tasks.md`. Un fallo descubierto requiere su propia corrección acotada; no se da por reparado por aparecer en esta lista.

## Decisiones recomendadas para lo ausente

**RECOMENDACIÓN, todavía no implementada:** notificaciones persistidas dentro de la aplicación, con estado leído/no leído. Avisar de presupuesto que llega al 80 %, presupuesto que supera 100 %, meta completada y meta vencida sin completar. El servidor determina estos estados y evita duplicados; la UI no infiere eventos de sus porcentajes.

Una notificación de presupuesto por tipo, presupuesto y mes; una de meta por tipo y meta en el MVP. Reabrir una meta o editarla no genera otra alerta del mismo tipo en esta primera versión. Si pasa directamente de menos de 80 % a más de 100 %, emitir únicamente la alerta de exceso para ese cambio. Las alertas ya generadas permanecen como historial. Fechas en America/La_Paz. Estas decisiones deben constar en el contrato entregado por la otra sesión.

Sin correo, push, SMS, tareas en segundo plano del navegador ni tiempo real. Cargar al entrar en la bandeja y al actualizar manualmente; no introducir polling ni websocket para el MVP.

## Traspaso externo

Entregar [el plan de notificaciones](../specs/007-notificaciones/plan.md) a una sesión del servicio. Allí se confirmará o ajustará el contrato; esta sesión no inspecciona ni modifica el repositorio hermano.

Para cerrar seguridad y datos, solicitar resultados sobre hash seguro, revocación, rechazo de accesos cruzados y persistencia tras reinicio. Para mutaciones, solicitar entorno aislado con dos cuentas y datos sintéticos; el runner real actual cubre solo lectura del panel.

La disponibilidad actual de esa infraestructura no se ha comprobado en esta entrega. Existe evidencia histórica de integración pendiente; no se afirma una caída actual del servicio.
