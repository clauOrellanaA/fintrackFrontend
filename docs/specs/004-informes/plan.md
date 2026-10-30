# Plan M4 · Estadísticas e informes
Estado: reconstrucción técnica del frontend existente; validación real pendiente.
Base auditada: 6f4679e; fecha: 2026-10-29.

## Estructura existente y RF
- `src/features/reports/ReportsPage.tsx`: métricas, distribución, serie y formulario de período; RF-M4-01 a RF-M4-04.
- `hooks/useReports.ts`: consulta por token/intervalo, errores y descarte de respuestas tardías; todos los RF.
- `api/reports.ts`, `api/contract.ts`: contrato y coherencia de intervalo; todos los RF.
- `lib/period.ts`: fechas reales, meses inclusivos y período inicial de Bolivia; RF-M4-04.
- `shared/formatters/money.ts`: representación exacta, incluso negativos; RF-M4-01/02/03.

## Contrato consumido y datos
- `GET reports?from=YYYY-MM-DD&to=YYYY-MM-DD`, Bearer; RF-M4-04.
- Respuesta: period con from/to/timeZone/start/endExclusive, currency BOB y asOf.
- comparison con income/expense/net; RF-M4-01.
- expenseDistribution con categoryId nullable, categoryName, amount y percentage; RF-M4-02.
- balanceEvolution con month, amount y cutoff; RF-M4-03.
- Importes como cadenas exactas con dos decimales, negativos donde el esquema los admite; calendario America/La_Paz.
- La API devuelve agregados y límites temporales; el cliente verifica coincidencia from/to y no recomputa resultados.
- Inicio: primer día del mes de once meses atrás hasta hoy en Bolivia.
- Validación local: fechas existentes, from <= to, hasta 24 meses calendario inclusivos; RF-M4-04.
- Error HTTP/timeout/respuesta inválida se presenta como fallo con reintento, no como vacío.

## Decisiones y alternativa
- Mantener gráfico y tabla existentes; alternativa descartada: añadir biblioteca para adoptar SDD.
- Documentar que la línea representa posición relativa de saldos, no una escala monetaria proporcional; valores exactos están en tabla; RF-M4-03.
- Mantener límite de 24 meses y consulta explícita; alternativa descartada: rango ilimitado o solicitudes por cada cambio de campo.
- Mantener strings monetarios; alternativa descartada: sumar agregados en el navegador.

## Estrategia de comprobación
- RF-M4-01/02/03: `ReportsPage.test.tsx`, carga/valores exactos, alternativas textuales, vacío y reintento.
- RF-M4-04: `lib/period.test.ts`, fechas bisiestas, meses inclusivos y frontera UTC/Bolivia.
- Todos: `api/reports.test.ts`, validación, Bearer, no-store y período incorrecto.
- RF-M4-04 y sesión: `hooks/useReports.test.tsx`, respuesta tardía y 401.
- Navegador: `e2e/reports.spec.ts`, filtros, BOB y alternativas accesibles.
- Candidatos: `npm test` y `npm run test:e2e`; NO ejecutados en esta auditoría.
- La suite real existente es del panel, no de informes; crear evidencia de informes requiere recorrido separado.

## Pendiente y cierre
Consultar [tareas](tasks.md); no declarar exactitud de agregados por fixtures controlados.
Solicitar comprobaciones externas de fechas de corte, inclusión del último día y persistencia.

## Matriz de datos de cierre preparada en FE-SDD-02

Escenarios sintéticos para la validación integrada futura; preparar el dataset en la sesión del servicio. No son resultados de una API ejecutada. El frontend presenta los agregados recibidos.

| Escenario | Entrada y respuesta esperada | Comprobación |
| --- | --- | --- |
| Vacío | `from=2026-10-01`, `to=2026-10-31`; income/expense/net `0.00`, distribuciones y evolución vacías | Vacío con métricas cero y alternativas sin filas inventadas; distinto de fallo HTTP |
| Neto negativo | Mismo período, income `100.00`, expense `150.00`, net `-50.00`; gasto de categoría `150.00/100.00` | Valores BOB exactos y signo negativo; no recalcular neto en UI |
| Un día | `from=to=2026-10-30`; inicio `2026-10-30T00:00:00-04:00`, fin exclusivo `2026-10-31T00:00:00-04:00` | El servicio incluye el último instante de ese día y excluye el siguiente; respuesta coincide con fechas solicitadas |
| Cambio de año | `from=2025-12-31`, `to=2026-01-01`; meses 2025-12 y 2026-01 con balances sintéticos `100.00` y `-50.00` | Ambas filas y cortes legibles, sin desplazar día/mes por zona del dispositivo |
| 24 meses | `from=2025-01-01`, `to=2026-12-31` | 24 meses calendario inclusivos aceptados; tabla mantiene valores de cada mes recibidos |
| Más de 24 meses | `from=2024-12-31`, `to=2026-12-31` | Rechazo local antes de nueva solicitud; no reemplazar el último informe con datos ficticios |

Para cada caso, comparar respuesta del servicio con UI y con valores esperados del dataset. Confirmar cortes/inclusión del último día, propiedad y persistencia externamente. La suite real actual solo cubre panel; M4-T4/T5 requieren un recorrido propio de informes. Ver [traspaso](../../sdd/service-handoff.md).
