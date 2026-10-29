# Plan M1 · Panel principal
Estado: reconstrucción técnica del frontend existente; no autoriza implementación.
Base auditada: 6f4679e; fecha: 2026-10-29.

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
