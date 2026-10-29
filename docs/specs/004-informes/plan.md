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
