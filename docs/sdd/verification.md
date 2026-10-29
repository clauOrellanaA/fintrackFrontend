# Verificación y trazabilidad SDD

Fecha de documentación: 2026-10-29. Base inspeccionada: `6f4679e62dac6bfd067ca4472413f5dccff8f39d`, obtenida mediante `git fetch origin dev`.
Rama documental: `docs/fe-sdd-baseline`. Worktree: `C:/fintrack/worktrees/frontend/fe-sdd-baseline`. Responsable único de Git: coordinador. Sin commit, push, merge ni despliegue.

## Alcance de esta entrega

Se inspeccionaron código, contratos y archivos de pruebas; se redactaron constitución, specs, planes y tareas. No se modificó código funcional ni se ejecutaron Vitest, Playwright, lint, typecheck o build. No se ejecutó la suite real ni se comprobó disponibilidad actual de la API. No se instalaron dependencias.

La columna “test candidato” identifica cobertura existente para revisar; **todas las pruebas funcionales de esta tabla tienen resultado NO EJECUTADO en esta entrega**. Una prueba puede cubrir solo parte del RF. Los planes y tareas detallan las ampliaciones.

## Matriz requisito → prueba → resultado

Abreviaturas de rutas: D = `src/features/dashboard`, T = `src/features/transactions`, B = `src/features/budgets`, R = `src/features/reports`, A = `src/features/account`. Nombres completos de tests y casos se consultan en esos archivos; no se añaden tests por documentarlos aquí.

| RF | Test candidato existente | Alcance y brecha | Resultado actual |
| --- | --- | --- | --- |
| RF-M1-01 | D/components/BalanceCard.test.tsx | Saldo negativo exacto y corte; cálculo externo pendiente | No ejecutado |
| RF-M1-02 | D/components/MonthlySummaryCards.test.tsx | Ingresos/gastos recibidos; agregación externa pendiente | No ejecutado |
| RF-M1-03 | D/components/ExpenseDistribution.test.tsx | Distribución y alternativa textual | No ejecutado |
| RF-M1-04 | D/components/BudgetIndicators.test.tsx y SavingsGoalsCard.test.tsx | Estados recibidos, 80/100/>100 y metas; no gestión de metas | No ejecutado |
| RF-M2-01 | T/hooks/useTransactionMutations.test.ts | Requests crear/editar/anular, no recorrido UI completo | No ejecutado |
| RF-M2-02 | T/hooks/useCategories.test.ts | Carga/creación/conflicto, cobertura parcial de UI y renombre | No ejecutado |
| RF-M2-03 | T/hooks/useTransactionMutations.test.ts | Payload de mutación; validaciones del formulario sin prueba propia | No ejecutado |
| RF-M2-04 | Sin test específico de TransactionsPage/useTransactions | Filtros, búsqueda y paginación necesitan cobertura | Sin cobertura específica |
| RF-M3-01 | B/BudgetsPage.test.tsx y hooks/useBudgets.test.tsx | Camino crear/editar/eliminar | No ejecutado |
| RF-M3-02 | B/BudgetsPage.test.tsx | Categoría en creación; faltan duplicado y ausencia de categorías | No ejecutado |
| RF-M3-03 | B/BudgetsPage.test.tsx y D/components/BudgetIndicators.test.tsx | Gestión y presentación, cobertura parcial | No ejecutado |
| RF-M3-04 | D/components/BudgetIndicators.test.tsx | Estados a 80/100/>100; ampliar pantalla presupuestos y cálculo externo | No ejecutado |
| RF-M4-01 | R/ReportsPage.test.tsx | Valores BOB/corte; servicio no acreditado | No ejecutado |
| RF-M4-02 | R/ReportsPage.test.tsx | Distribución y alternativa textual | No ejecutado |
| RF-M4-03 | R/ReportsPage.test.tsx | Gráfico/tabla y vacío; gráfico actual usa posiciones relativas | No ejecutado |
| RF-M4-04 | R/ReportsPage.test.tsx, lib/period.test.ts, hooks/useReports.test.tsx | Fechas inválidas, límites y respuesta vigente | No ejecutado |
| RF-M5-01 | Sin test propio de gestión de metas | UI existente; pruebas del panel no cubren crear/editar/archivar/restaurar | Sin cobertura específica |
| RF-M5-02 | Sin test propio de gestión de metas | Objetivo positivo y fecha opcional requieren prueba | Sin cobertura específica |
| RF-M5-03 | D/components/SavingsGoalsCard.test.tsx solo lectura | Aporte/retiro y mutaciones de gestión carecen de cobertura propia | Sin cobertura de gestión |
| RF-M5-04 | Ninguno | Notificaciones centrales sin implementar | Sin implementación ni cobertura |
| RF-M6-01 | A/UserProfilePage.test.tsx y D/DashboardPage.test.tsx | Registro/login/logout controlados, cobertura parcial | No ejecutado |
| RF-M6-02 | A/UserProfilePage.test.tsx | Camino perfil; conflicto de nombre vacío por contrastar | No ejecutado |
| RF-M6-03 | A/UserProfilePage.test.tsx y D/hooks/useDashboard.test.tsx | Cambio y sesión local; hash/revocación global externos | No ejecutado; evidencia externa pendiente |
| RF-M6-04 | D/hooks/useDashboard.test.tsx y e2e/real/dashboard.real.spec.ts | Limpieza local y lectura A/B; no prueba autorización cruzada del servidor | No ejecutado; evidencia externa pendiente |
| RF-N-01 | Ninguno; planificado | Bandeja, lista y páginas | Sin implementación ni cobertura |
| RF-N-02 | Ninguno; planificado | Eventos de presupuesto/deduplicación externos | Sin implementación ni cobertura |
| RF-N-03 | Ninguno; planificado | Eventos de metas/vencimiento externos | Sin implementación ni cobertura |
| RF-N-04 | Ninguno; planificado | Lectura persistida | Sin implementación ni cobertura |
| RF-N-05 | Ninguno; planificado | Sesión, error y respuestas tardías | Sin implementación ni cobertura |

## Referencias concretas de tests encontrados

- BalanceCard: `renders the backend balance exactly, including a negative amount and explicit cutoff`.
- MonthlySummaryCards: `renders gross monthly income and expense from the contract without a net result`.
- ExpenseDistribution: `renders the exact expense distribution with its textual alternative`.
- BudgetIndicators: `represents backend states and progress at 80, 100 and above 100 percent`.
- SavingsGoalsCard: `represents active, completed, exceeded and overdue goals from the contract`.
- useTransactionMutations: `creates, updates, and voids movements through authenticated API requests`.
- useCategories: `keeps category deletion conflicts visible to the caller`.
- BudgetsPage: `creates, edits and deletes a monthly budget through the authenticated dashboard UI`.
- ReportsPage: `shows loading then exact BOB report values and textual alternatives to both charts`; `keeps invalid date ranges local, announces the problem and makes no extra request`.
- UserProfilePage: `registers an account, updates its profile and requires sign-in after changing the password`.
- useDashboard: `clears private state before logout resolves and never stores the token in browser storage`.
- Suite real optativa: `two real accounts render their own API response and clear data on logout`. Solo lectura del panel; no prueba mutaciones ni rechazo de un ID ajeno.

## Criterios de cierre

La base funcional completa **no se declara cumplida**: RF-M5-04 está pendiente, faltan pruebas propias de gestión de metas y de otros recorridos, y protección/aislamiento/persistencia requieren evidencia externa. La entrega documental sí puede revisarse sin ejecutar implementación.

Para ejecutar después, usar los scripts existentes de package.json: `npm test`, `npm run test:e2e`, `npm run test:e2e:real`, `npm run lint`, `npm run typecheck` y `npm run build`, según el alcance modificado. El runner real requiere variables y cuentas sintéticas descritas en [integración](../integration.md). Su resultado nunca se presupone.

Los conteos y resultados de los documentos de entregas anteriores son históricos. Un bloqueo antiguo de servicio no demuestra que hoy esté caído; una prueba controlada aprobada antiguamente no demuestra que esta base pase actualmente.

## Validación documental de esta entrega

Comprobación estática ejecutada mediante PowerShell: 28 documentos nuevos, 49 enlaces relativos existentes, 7 specs, 29 IDs RF únicos y presentes en esta matriz, 50 tareas pendientes y 50 criterios «Hecho cuando:». Todas las tareas indican 20–30 minutos y la constitución contiene seis principios dentro del máximo de 15 líneas. Se comprobó ausencia de espacios finales y marcadores de conflicto. Una línea vacía sobrante al final de architecture.md detectada por git diff --check se corrigió antes de repetir el control final.

Revisión independiente documental: completada por frontend-reviewer, sin hallazgos bloqueantes después de precisar que el mínimo de contraseña aplica a la nueva y de asignar explícitamente la mutación de lectura al hook de notificaciones. Sin pruebas funcionales. El alcance de git status contiene exclusivamente docs/. Los documentos nuevos también se comprobaron directamente, porque git diff --check por sí solo no revisa archivos sin seguimiento.

Control final aprobado: git diff --check sin errores, 29 documentos nuevos/modificados exclusivamente en docs/, 52 enlaces relativos válidos incluyendo architecture.md y constitución de 7 líneas. No se preparó índice ni se crearon commits.

Esta evidencia acredita la estructura y coherencia documental; no sustituye las aceptaciones funcionales pendientes de la matriz.
