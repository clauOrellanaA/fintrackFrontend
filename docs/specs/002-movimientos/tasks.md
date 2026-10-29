# Tareas pendientes M2
Duraciones para una entrega pequeña por casilla; no incluyen preparar infraestructura externa.

- [ ] **M2-T1 · Cubrir validación de campos** · 25 min · RF-M2-03 · Depende: fixtures sintéticos del contrato.
  Hecho cuando: pruebas de pantalla comprueban importe cero/mal formado, dos decimales, descripción opcional y recortada, y fecha/hora enviada sin dinero convertido a Number.
- [ ] **M2-T2 · Cubrir filtros y paginación** · 30 min · RF-M2-04 · Depende: M2-T1.
  Hecho cuando: pruebas verifican rango de un día completo de Bolivia, fechas invertidas sin consulta, tipo/estado/texto, reinicio a página 1 y páginas de diez.
- [ ] **M2-T3 · Cubrir carga y respuestas tardías** · 25 min · RF-M2-04 · Depende: M2-T2.
  Hecho cuando: pruebas distinguen carga/vacío/fallo con reintento y descartan respuestas de otro filtro o sesión.
- [ ] **M2-T4 · Cubrir recorridos de movimiento** · 30 min · RF-M2-01 · Depende: M2-T1.
  Hecho cuando: pruebas de pantalla verifican crear/editar, cancelar y confirmar anulación, fallo sin éxito y ausencia de acciones para anulados.
- [ ] **M2-T5 · Cubrir clasificación y conflictos** · 25 min · RF-M2-02 · Depende: M2-T1.
  Hecho cuando: pruebas verifican categoría opcional, alta/renombrado, aviso de conservación de movimientos y conflicto por presupuesto al eliminar.
- [ ] **M2-T6 · Registrar evidencia local por RF** · 20 min · RF-M2-01/02/03/04 · Depende: M2-T2/T3/T4/T5.
  Hecho cuando: se ejecutan las pruebas de movimientos y se vincula cada RF con test, comando, resultado y SHA, incluyendo fallos.
- [ ] **M2-T7 · Contrastar mutaciones reales** · 30 min · RF-M2-01/02/03/04 · Depende: M2-T6, API aislada y datos de dos cuentas.
  Hecho cuando: existe evidencia de crear/editar/anular, filtros y clasificación en la API, con historial conservado y acceso cruzado rechazado; la persistencia se vincula a validación externa.
