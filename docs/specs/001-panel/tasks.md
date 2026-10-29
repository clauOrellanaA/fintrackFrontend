# Tareas pendientes M1
Todas las casillas empiezan pendientes. Documentar código existente no equivale a ejecutar estas tareas.

- [ ] **M1-T1 · Registrar comprobaciones locales** · 25 min · RF-M1-01/02/03/04 · Depende: dependencias instaladas desde lockfile.
  Hecho cuando: se ejecutan los tests del panel y formato, y se anotan comando, SHA, resultado y RF sin cobertura en la evidencia de validación.
- [ ] **M1-T2 · Registrar comprobación de navegador controlada** · 25 min · RF-M1-02/03/04 · Depende: M1-T1 y Chromium disponible.
  Hecho cuando: se ejecutan los E2E existentes del panel en móvil/escritorio y se registran resultados de carga, errores, teclado, nombres/importes largos y 320 px.
- [ ] **M1-T3 · Preparar mapa de integración real** · 20 min · RF-M1-01/02/03/04 · Depende: M1-T1.
  Hecho cuando: cada RF identifica dato sintético esperado, comprobación por UI y comprobación externa necesaria, sin credenciales en documentos.
- [ ] **M1-T4 · Ejecutar lectura real del panel** · 30 min · RF-M1-01/02/03/04 · Depende: M1-T3, API aislada y dos cuentas sintéticas con datos representativos.
  Hecho cuando: `npm run test:e2e:real` tiene resultado registrado con SHA y RF; si falta infraestructura, queda bloqueo registrado y esta tarea sin marcar.
- [ ] **M1-T5 · Contrastar cálculos y persistencia** · 20 min · RF-M1-01/02/03/04 · Depende: M1-T4 y evidencia proporcionada por la sesión del servicio.
  Hecho cuando: se vinculan resultados externos de agregación, propiedad y persistencia, o se conserva explícitamente el cierre integrado pendiente.

Si una comprobación detecta un defecto, crear una corrección acotada con su prueba; estas tareas no incluyen reparar defectos aún desconocidos.
