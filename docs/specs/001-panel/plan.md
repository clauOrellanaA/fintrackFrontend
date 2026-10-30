# Plan M1 · Panel principal
Estado: reconstrucción técnica del frontend existente; no autoriza implementación.
Base auditada: 6f4679e; fecha: 2026-10-29.

## Trazabilidad de historias e issues

FE-SDD-03, 2026-10-30. El issue del módulo agrupa sus historias y tareas; permanece abierto hasta acreditar la aceptación completa. Las capacidades y pruebas locales existentes conservan su evidencia.

| Historia | Requisitos | Tareas | Issue |
| --- | --- | --- | --- |
| [HU-M1-01](spec.md#hu-m1-01) | `RF-M1-01`, `RF-M1-02` | [M1-T1](tasks.md), [M1-T2](tasks.md), [M1-T3](tasks.md), [M1-T4](tasks.md), [M1-T5](tasks.md) | [#31](https://github.com/clauOrellanaA/fintrackFrontend/issues/31) |
| [HU-M1-02](spec.md#hu-m1-02) | `RF-M1-03`, `RF-M1-04` | [M1-T1](tasks.md), [M1-T2](tasks.md), [M1-T3](tasks.md), [M1-T4](tasks.md), [M1-T5](tasks.md) | [#31](https://github.com/clauOrellanaA/fintrackFrontend/issues/31) |

El detalle de aceptación está en la [spec](spec.md); el estado de cada tarea se conserva en [tasks.md](tasks.md). Un enlace o un issue cerrado no sustituye los resultados por RF.

## Estructura existente y RF
- `src/features/dashboard/DashboardPage.tsx`: período, acceso, carga, error y vacío; RF-M1-01 a RF-M1-04.
- `hooks/useDashboard.ts`: consulta ligada a token/mes y descarte de respuestas antiguas; RF-M1-01 a RF-M1-04.
- `components/BalanceCard.tsx`: importe exacto y corte; RF-M1-01.
- `components/MonthlySummaryCards.tsx`: ingresos y gastos separados; RF-M1-02.
- `components/ExpenseDistribution.tsx`: gráfico y detalle textual; RF-M1-03.
- `components/BudgetIndicators.tsx` y `SavingsGoalsCard.tsx`: indicadores y alternativas; RF-M1-04.
- `shared/formatters/money.ts` y `shared/session`: formato exacto y sesión común; todos los RF.

## Contrato consumido y datos
- `GET dashboard?month=YYYY-MM`, Bearer; esquema `api/contract.ts`; todos los RF.
- Respuesta: `period`, `currency: BOB`, `asOf`, `sections`.
- `balance`: amount/cutoff; `monthlySummary`: income/expense; RF-M1-01/02.
- `expenseDistribution`: categoría, amount y percentage; RF-M1-03.
- `budgets`: límite, consumido, restante, progreso y estado; `savingsGoals`: objetivo, acumulado, restante, progreso, estado y fecha nullable; RF-M1-04.
- Cada sección distingue `ready` y `notAvailable`; vacío global exige cinco secciones disponibles con ceros/listas vacías.
- Dinero como cadena de dos decimales, hasta doce dígitos enteros; calendario America/La_Paz.
- `api/dashboard.ts` rechaza otro mes y un cutoff del saldo distinto de asOf; todos los RF.
- Persistencia, autorización y cálculo son dependencia de la API; el cliente presenta resultados.

## Decisiones y alternativa
- Conservar componentes y hooks existentes; alternativa descartada: reconstruir el panel para adoptar SDD.
- Mantener importes como strings y gráficos actuales; alternativa descartada: convertir dinero a Number o añadir biblioteca sin necesidad.
- Conservar estados entregados por el servicio; alternativa descartada: recalcular estados financieros en UI.

## Estrategia de comprobación
- RF-M1-01: `BalanceCard.test.tsx`, `shared/formatters/money.test.ts`.
- RF-M1-02: `MonthlySummaryCards.test.tsx`, `api/dashboard.test.ts`, `hooks/useDashboard.test.tsx`.
- RF-M1-03: `ExpenseDistribution.test.tsx`; RF-M1-04: `BudgetIndicators.test.tsx`, `SavingsGoalsCard.test.tsx`.
- Todos: `DashboardPage.test.tsx`, `e2e/dashboard.spec.ts`, `e2e/dashboard-acceptance.spec.ts`.
- Candidatos: `npm test` y `npm run test:e2e`; NO ejecutados en esta auditoría.
- `e2e/real/dashboard.real.spec.ts` comprueba lectura con dos cuentas; requiere API aislada y configuración del operador.
- Esa lectura no acredita cálculos internos, persistencia tras reinicio ni autorización de escrituras.

## Pendiente y cierre
Ejecutar y vincular evidencia por RF sin reutilizar conteos históricos como resultado actual.
Consultar [tareas](tasks.md); cerrar integración solo con evidencia externa disponible.

## Mapa de integración preparado en FE-SDD-02

Datos de aceptación sintéticos propuestos para el operador, sin ejecutar API real. La UI debe mostrar el valor recibido; estas cifras no se calculan en el navegador.

| RF | Datos sintéticos esperados | Comprobación UI | Evidencia externa necesaria |
| --- | --- | --- | --- |
| RF-M1-01 | `amount: "-125.50"`, corte `2026-10-30T12:00:00-04:00` igual a asOf; otro caso `0.00` | Saldo exacto en BOB, signo y corte, separado del resultado mensual | Saldo inicial, movimientos vigentes y reservas de metas producen ese saldo; anulados excluidos; persiste tras reinicio |
| RF-M1-02 | Mes 2026-10, `income: "1200.00"`, `expense: "1500.00"`; otro mes sin actividad ambos `0.00` | Ingreso y gasto separados del mismo período, sin sustituirlos por neto | Límites de mes Bolivia e inclusión/exclusión de movimientos en ambos extremos |
| RF-M1-03 | Dos categorías `100.00/33.33` y `200.00/66.67`; otra consulta lista vacía | Importe y porcentaje recibidos en gráfico y alternativa textual; vacío distinguido de notAvailable | Agregación por categoría y redondeo; categorías eliminadas/sin categoría; mismo período que resumen |
| RF-M1-04 | Presupuestos `79.99 normal`, `80.00 warning`, `100.00 warning`, `100.01 exceeded`; metas activa sin fecha, completada con progreso 120.00 y vencida | Etiquetas del servicio, importes exactos, porcentaje completo en texto y barra contenida; listas vacías | Cálculo de consumo/umbrales, efecto de aportes/retiros sobre saldo, vencimiento Bolivia y propiedad por cuenta |

Recorrer el conjunto con A y B de datos distintos; cerrar sesión y comprobar limpieza. El runner real compara UI y API; los cálculos esperados y la persistencia requieren además resultados del servicio. Ver [traspaso](../../sdd/service-handoff.md). Sin configuración de cuentas/API aislada no se marca M1-T4/T5.
