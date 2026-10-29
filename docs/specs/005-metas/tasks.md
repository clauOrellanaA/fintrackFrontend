# Tareas pendientes M5
La gestión ya está implementada. Estas tareas agregan cobertura y evidencia; no se han ejecutado.

- [ ] **M5-T1 · Preparar fixtures de gestión** · 20 min · RF-M5-01/02/03 · Depende: contrato vigente.
  Hecho cuando: los datos sintéticos incluyen meta activa, sin fecha, completada, vencida y archivada, con respuestas de crear/editar/aporte/retiro válidas para el esquema.
- [ ] **M5-T2 · Cubrir crear y editar objetivo** · 30 min · RF-M5-01/02 · Depende: M5-T1.
  Hecho cuando: pruebas de pantalla verifican nombre recortado, objetivo positivo con dos decimales, fecha opcional y rechazo local de valores inválidos sin solicitud.
- [ ] **M5-T3 · Cubrir aportes y retiros** · 30 min · RF-M5-03 · Depende: M5-T1.
  Hecho cuando: pruebas comprueban ambos payloads, recarga tras éxito, conflicto de retiro y ausencia de mensaje de éxito si la API falla.
- [ ] **M5-T4 · Cubrir archivo y lectura de estados** · 25 min · RF-M5-01/03 · Depende: M5-T1.
  Hecho cuando: pruebas verifican archivar/restaurar sin DELETE, ausencia de aportar/retirar en archivadas, restantes/progresos exactos y barra contenida por encima del 100 %.
- [ ] **M5-T5 · Cubrir sesión y estados de consulta** · 25 min · RF-M5-01/03 · Depende: M5-T1.
  Hecho cuando: pruebas distinguen carga/vacío/fallo/reintento, descartan respuesta de otra sesión y eliminan sesión ante un 401 coincidente.
- [ ] **M5-T6 · Registrar resultados de gestión** · 20 min · RF-M5-01/02/03 · Depende: M5-T2/T3/T4/T5.
  Hecho cuando: se ejecutan pruebas de gestión con comando, SHA y resultado por RF; el test de tarjeta del panel no se presenta como cobertura de mutaciones.
- [ ] **M5-T7 · Contrastar operaciones reales** · 30 min · RF-M5-01/02/03 · Depende: M5-T6 y API aislada con cuentas sintéticas.
  Hecho cuando: crear/editar/aportar/retirar/archivar/restaurar se observan sobre API real y se vincula evidencia externa de historial, propiedad y efecto sobre saldo.
- [ ] **M5-T8 · Vincular cierre de notificaciones** · 20 min · RF-M5-04 · Depende: entregas de [007](../007-notificaciones/tasks.md).
  Hecho cuando: la matriz del módulo enlaza los resultados de notificaciones; mientras 007 esté pendiente, RF-M5-04 sigue sin marcar como cumplido.
