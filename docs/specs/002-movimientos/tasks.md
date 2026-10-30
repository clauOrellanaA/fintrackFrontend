# Tareas pendientes M2
Duraciones para una entrega pequeña por casilla; no incluyen preparar infraestructura externa.

- [x] **M2-T1 · Cubrir validación de campos** · 25 min · RF-M2-03 · Depende: fixtures sintéticos del contrato.
  Hecho cuando: pruebas de pantalla comprueban importe cero/mal formado, dos decimales, descripción opcional y recortada, y fecha/hora enviada sin dinero convertido a Number.
- [x] **M2-T2 · Cubrir filtros y paginación** · 30 min · RF-M2-04 · Depende: M2-T1.
  Hecho cuando: pruebas verifican rango de un día completo de Bolivia, fechas invertidas sin consulta, tipo/estado/texto, reinicio a página 1 y páginas de diez.
- [x] **M2-T3 · Cubrir carga y respuestas tardías** · 25 min · RF-M2-04 · Depende: M2-T2.
  Hecho cuando: pruebas distinguen carga/vacío/fallo con reintento y descartan respuestas de otro filtro o sesión.
- [x] **M2-T4 · Cubrir recorridos de movimiento** · 30 min · RF-M2-01 · Depende: M2-T1.
  Hecho cuando: pruebas de pantalla verifican crear/editar, cancelar y confirmar anulación, fallo sin éxito y ausencia de acciones para anulados.
- [x] **M2-T5 · Cubrir clasificación y conflictos** · 25 min · RF-M2-02 · Depende: M2-T1.
  Hecho cuando: pruebas verifican categoría opcional, alta/renombrado, aviso de conservación de movimientos y conflicto por presupuesto al eliminar.
- [x] **M2-T6 · Registrar evidencia local por RF** · 20 min · RF-M2-01/02/03/04 · Depende: M2-T2/T3/T4/T5.
  Hecho cuando: se ejecutan las pruebas de movimientos y se vincula cada RF con test, comando, resultado y SHA, incluyendo fallos.
- [ ] **M2-T7 · Contrastar mutaciones reales** · 30 min · RF-M2-01/02/03/04 · Depende: M2-T6, API aislada y datos de dos cuentas.
  Hecho cuando: existe evidencia de crear/editar/anular, filtros y clasificación en la API, con historial conservado y acceso cruzado rechazado; la persistencia se vincula a validación externa.

Actualización FE-SDD-02 (2026-10-30): checks locales aprobados, Vitest 98/98 y Playwright 24/24. Véase [evidencia por RF](../../sdd/verification.md). Las casillas abiertas requieren evidencia externa o funcionalidad todavía pendiente.

## Relación de tareas, historias e issue

Los estados y criterios anteriores se conservan; esta tabla aporta trazabilidad sin acreditar trabajo adicional. El [plan](plan.md#trazabilidad-de-historias-e-issues) relaciona cada historia con sus RF.

| Tarea | Historias | Issue |
| --- | --- | --- |
| `M2-T1` | [HU-M2-01](spec.md#hu-m2-01) | [#32](https://github.com/clauOrellanaA/fintrackFrontend/issues/32) |
| `M2-T2` | [HU-M2-02](spec.md#hu-m2-02) | [#32](https://github.com/clauOrellanaA/fintrackFrontend/issues/32) |
| `M2-T3` | [HU-M2-02](spec.md#hu-m2-02) | [#32](https://github.com/clauOrellanaA/fintrackFrontend/issues/32) |
| `M2-T4` | [HU-M2-01](spec.md#hu-m2-01) | [#32](https://github.com/clauOrellanaA/fintrackFrontend/issues/32) |
| `M2-T5` | [HU-M2-03](spec.md#hu-m2-03) | [#32](https://github.com/clauOrellanaA/fintrackFrontend/issues/32) |
| `M2-T6` | [HU-M2-01](spec.md#hu-m2-01), [HU-M2-02](spec.md#hu-m2-02), [HU-M2-03](spec.md#hu-m2-03) | [#32](https://github.com/clauOrellanaA/fintrackFrontend/issues/32) |
| `M2-T7` | [HU-M2-01](spec.md#hu-m2-01), [HU-M2-02](spec.md#hu-m2-02), [HU-M2-03](spec.md#hu-m2-03) | [#32](https://github.com/clauOrellanaA/fintrackFrontend/issues/32) |
