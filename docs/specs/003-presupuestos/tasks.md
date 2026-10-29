# Tareas pendientes M3
Casillas pendientes de evidencia o ampliación de cobertura; la gestión base ya existe.

- [ ] **M3-T1 · Cubrir límites inválidos y categorías** · 25 min · RF-M3-01/02 · Depende: fixtures de contrato.
  Hecho cuando: pruebas comprueban límite cero/mal formado, categoría obligatoria, falta/fallo de catálogo y conflicto duplicado sin informar éxito.
- [ ] **M3-T2 · Cubrir estados y porcentajes en gestión** · 25 min · RF-M3-03/04 · Depende: M3-T1.
  Hecho cuando: pruebas presentan 79,99 %, 80 %, 100 % y 100,01 % con sus estados recibidos, porcentaje exacto, exceso y barra contenida.
- [ ] **M3-T3 · Cubrir consulta y confirmación** · 25 min · RF-M3-01/03 · Depende: M3-T1.
  Hecho cuando: pruebas comprueban cancelar eliminación sin DELETE, fallo recuperable, mes vacío, cambio rápido de mes y descarte de sesión anterior.
- [ ] **M3-T4 · Registrar evidencia local** · 20 min · RF-M3-01/02/03/04 · Depende: M3-T2/T3.
  Hecho cuando: se ejecutan pruebas de gestión e indicadores y cada RF tiene resultado, comando y SHA; no se confunde estado simulado con cálculo aprobado.
- [ ] **M3-T5 · Contrastar consumo y umbrales reales** · 30 min · RF-M3-01/02/03/04 · Depende: M3-T4, API aislada y dataset sintético.
  Hecho cuando: se comparan límite, movimientos computados, restante y estados en bordes; duplicado se rechaza y eliminar límite conserva movimientos, con evidencia externa de persistencia.
