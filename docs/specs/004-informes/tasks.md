# Tareas pendientes M4
No se reconstruyen informes ya existentes; se cierra evidencia por RF.

- [x] **M4-T1 · Registrar pruebas locales de informes** · 25 min · RF-M4-01/02/03/04 · Depende: dependencias instaladas desde lockfile.
  Hecho cuando: se ejecutan tests de pantalla, contrato, hook y período y se registra resultado por RF, SHA y comando.
- [x] **M4-T2 · Registrar recorrido de navegador** · 25 min · RF-M4-01/02/03/04 · Depende: M4-T1 y Chromium.
  Hecho cuando: se ejecuta el E2E existente de informes en sus proyectos configurados y se registra evidencia de filtros, resultados y alternativas textuales.
- [x] **M4-T3 · Definir matriz de datos de cierre** · 20 min · RF-M4-01/02/03/04 · Depende: M4-T1.
  Hecho cuando: se documentan entradas sintéticas y resultados esperados para vacío, neto negativo, un día, cambio de año y 24 meses, sin recomputar finanzas en la UI.
- [ ] **M4-T4 · Contrastar consulta real de informes** · 30 min · RF-M4-01/02/03/04 · Depende: M4-T2/T3 y API aislada con dataset provisto por su operador.
  Hecho cuando: se comparan cifras y períodos visibles con respuestas reales y resultados esperados; el último día y los cortes se confirman con evidencia de la sesión del servicio.
- [ ] **M4-T5 · Consolidar veredicto por RF** · 20 min · RF-M4-01/02/03/04 · Depende: M4-T4.
  Hecho cuando: cada RF indica test/recorrido, ejecución y resultado; cualquier agregado o persistencia sin verificar mantiene el cierre integrado pendiente.

Actualización FE-SDD-02 (2026-10-30): checks locales aprobados, Vitest 98/98 y Playwright 24/24. Véase [evidencia por RF](../../sdd/verification.md). Las casillas abiertas requieren evidencia externa o funcionalidad todavía pendiente.
