# Verificación y trazabilidad SDD

## FE-SDD-03 · Historias e issues

Fecha: 2026-10-30. Base `11d6552aabe8961ea5fbcffdfe09f78af6a29c83` más el diff del worktree `C:/fintrack/worktrees/frontend/fe-sdd-03-user-stories-issues`. Rama `docs/fe-sdd-03-user-stories-issues`; coordinador único responsable de Git y de los issues remotos.

Entrega documental: 18 historias con IDs HU estables, trazabilidad historia → RF → tarea → issue en los siete planes y relación inversa en tareas. Se conservan los textos de las historias, los 29 RF, las 50 tareas, sus criterios y las 25 casillas completadas. Las plantillas y el flujo exigen mantener estos vínculos.

Se consultaron issues abiertos y cerrados y se crearon siete seguimientos de módulo: #31, #32, #33, #34, #35, #37 y #38. Se verificó cada issue con GET: 18 historias, 50 tareas y 25 casillas completadas, todos abiertos mientras falte aceptación integrada. El issue #35 enlaza su dependencia de notificaciones #38. Enlaces individuales en el [índice de historias e issues](../README.md#seguimiento-de-historias-e-issues). No se modificaron recursos del repositorio del servicio.

Validaciones ejecutadas por frontend-documenter: 304 enlaces relativos y anchors válidos, IDs únicos, cobertura completa de historias/RF/tareas, comparación de textos, checkboxes y criterios con la base Git, Unicode y `git diff --check` aprobados. El coordinador verificó los siete issues mediante la API de GitHub. Revisión independiente de los 25 Markdown aprobada sin hallazgos bloqueantes: 311 enlaces relativos y anchors válidos, trazabilidad coherente sin historias, RF o tareas huérfanos y estados originales conservados. No hubo nuevas ejecuciones funcionales.

No se ejecutaron suites funcionales: el diff contiene únicamente Markdown. Los resultados de FE-SDD-02 que siguen corresponden a esa entrega, no a una nueva ejecución. Esta actualización de trazabilidad no implementa notificaciones ni cierra integración, persistencia o seguridad del servicio; tampoco cierra automáticamente sus issues.

## FE-SDD-02 · Correcciones y cobertura local

Fecha: 2026-10-30. Base `e9e6bd4d3c9a36c02d3e7e41cc58a9a2c5d01983` más el diff del worktree `C:/fintrack/worktrees/frontend/fe-sdd-02-spec-completion`. Rama `fix/fe-sdd-02-spec-completion`; coordinador único responsable de Git. Esta identificación describe la versión de trabajo comprobada, sin atribuirla a un commit futuro.

Se corrigieron formularios privados persistentes entre sesiones en presupuestos/metas/perfil, confirmaciones tardías de cuenta que afectaban otra sesión, selector mensual vacío y reconsulta de informes con el mismo intervalo. La compatibilidad local de perfil antiguo usa el PATCH parcial omitiendo un nombre vacío. El test de cambio de contraseña espera el aviso visible en la ruta final con una consulta fresca.

Las regresiones se escribieron y ejecutaron antes de corregir producción: seis fallos en metas/presupuestos y cuatro en cuenta/informes. La primera revisión independiente de los cinco archivos de producción no encontró defectos bloqueantes. Estos resultados focalizados no sustituyen la validación final de todo el diff.

### Comandos y resultados de la versión final

QA independiente sobre código y pruebas finales: Node 24.15.0, npm 11.12.1.

| Comando | Resultado |
| --- | --- |
| `npm run lint` | Aprobado, exit 0 |
| `npm run typecheck` | Aprobado, exit 0 |
| `npm test` | 98/98 pruebas, 24 archivos, exit 0 |
| `npm run build` | Aprobado, exit 0 |
| `npm run test:e2e` | 24/24 Chromium escritorio/móvil, exit 0 |
| `git diff --check` | Aprobado, exit 0 |

Los E2E incluyen teclado, skip link, 320 px, importes extremos, informes, contraseñas, mes vacío y creación/archivo/restauración de metas. Usan HTTP sintético; no acreditan API real. Capturas generadas conservadas localmente, fuera del commit.

Revisión independiente de producción y tests sin hallazgos bloqueantes. El aviso de contraseña conserva la comprobación de visibilidad y espera la ruta final. El coordinador completó y comprobó la documentación tras agotarse la capacidad de los especialistas; no se atribuye revisión independiente final a esos cambios documentales.

### Matriz vigente de cobertura

Los archivos indicados contienen pruebas controladas con datos sintéticos. Resultado final local: Vitest 98/98 y Playwright 24/24 aprobados; los requisitos sin implementación o dependientes de evidencia externa conservan su estado pendiente. La matriz histórica inferior corresponde únicamente a su propia base documental.

| RF | Prueba / recorrido local | Alcance externo que sigue pendiente |
| --- | --- | --- |
| RF-M1-01 | `dashboard/components/BalanceCard.test.tsx`, `shared/formatters/money.test.ts`, E2E panel | Cálculo autoritativo del saldo, reservas y persistencia |
| RF-M1-02 | `MonthlySummaryCards.test.tsx`, `dashboard/api/dashboard.test.ts`, `hooks/useDashboard.test.tsx`, E2E panel | Agregación y cortes de mes Bolivia |
| RF-M1-03 | `ExpenseDistribution.test.tsx`, E2E panel | Agregación por categoría y redondeo |
| RF-M1-04 | `BudgetIndicators.test.tsx`, `SavingsGoalsCard.test.tsx`, E2E panel | Consumo y estados autoritativos de presupuestos/metas |
| RF-M2-01 | `transactions/TransactionsPage.test.tsx`, `hooks/useTransactionMutations.test.ts` | Crear/editar/anular en API real; conservación del historial |
| RF-M2-02 | `TransactionsPage.test.tsx`, `hooks/useCategories.test.ts` | Propiedad de categorías y conflicto real por presupuesto |
| RF-M2-03 | `TransactionsPage.test.tsx`: importe positivo exacto, fecha Bolivia y descripción opcional | Validaciones del servicio y persistencia |
| RF-M2-04 | `TransactionsPage.test.tsx`, `hooks/useTransactions.test.tsx`: filtros, búsqueda, páginas, error/vacío y respuestas antiguas | Datos de dos cuentas e inclusión real del día final |
| RF-M3-01 | `budgets/BudgetsPage.test.tsx`, `BudgetsPage.regression.test.tsx`, `hooks/useBudgets.test.tsx`, `e2e/budgets.spec.ts` | Mutaciones reales sin alterar movimientos |
| RF-M3-02 | `BudgetsPage.regression.test.tsx`: categoría obligatoria/ausente/fallida y duplicado | Rechazo autoritativo de duplicado y propiedad |
| RF-M3-03 | `BudgetsPage.regression.test.tsx`: valores exactos, barra contenida y restante negativo | Consumo y restante calculados por servicio |
| RF-M3-04 | `BudgetsPage.regression.test.tsx`, `BudgetIndicators.test.tsx`: 79,99/80/100/100,01 con estados recibidos | Cálculo de umbrales; no acredita notificaciones persistidas |
| RF-M4-01 | `reports/ReportsPage.test.tsx`, `api/reports.test.ts`, `e2e/reports.spec.ts` | Agregados reales de ingreso/gasto/neto |
| RF-M4-02 | `ReportsPage.test.tsx`, E2E informes: distribución textual | Agregación real por categoría |
| RF-M4-03 | `ReportsPage.test.tsx`, E2E informes: gráfico relativo y tabla exacta | Saldos y cortes mensuales reales |
| RF-M4-04 | `ReportsPage.test.tsx`, `lib/period.test.ts`, `hooks/useReports.test.tsx`: límites, tardíos y refresco del mismo rango | Inclusión del último día; recorrido real de informes |
| RF-M5-01 | `savings-goals/SavingsGoalsPage.test.tsx`, `e2e/savings-goals.spec.ts`: crear/editar/archivar/restaurar | Mutaciones reales, historial y propiedad |
| RF-M5-02 | `SavingsGoalsPage.test.tsx`: nombre recortado, importe positivo y fecha opcional | Validación del servicio |
| RF-M5-03 | `SavingsGoalsPage.test.tsx`: aporte/retiro, conflicto, estados, barra >100 y sesión | Efecto sobre saldo, persistencia y entradas reales |
| RF-M5-04 | Sin implementación; [contrato propuesto](../specs/007-notificaciones/plan.md) y [traspaso](service-handoff.md) | Contrato confirmado, implementación y eventos reales |
| RF-M6-01 | `account/UserProfilePage.test.tsx`, `shared/session/SessionProvider.test.tsx`, tests/E2E panel | Acceso y cierre del servicio real |
| RF-M6-02 | `UserProfilePage.regression.test.tsx`: perfil tardío, nombre legado y conflicto | Compatibilidad de nombre legado y conflictos reales |
| RF-M6-03 | `UserProfilePage.test.tsx`, regresiones, `e2e/account.spec.ts`: confirmación, longitud y error de contraseña | Hash seguro y revocación de todas las sesiones |
| RF-M6-04 | Regresiones A/B de cuenta/metas/presupuestos, `SessionProvider.test.tsx`, hooks de consulta | Rechazo de lectura/escritura ajena y persistencia; API real no ejecutada |
| RF-N-01..05 | Sin implementación ni tests de notificaciones | Todas las aceptaciones de la spec 007 siguen pendientes |

Rutas de features abreviadas desde `src/features`; rutas shared desde `src`. Los [planes M1](../specs/001-panel/plan.md) y [M4](../specs/004-informes/plan.md) contienen el mapa sintético de datos y comprobaciones para el operador.

### Dependencias y límites de cierre

No existe contrato confirmado de notificaciones disponible en este frontend. Se preparó [service-handoff.md](service-handoff.md), sin afirmar que otra sesión lo haya recibido ni implementado. RF-M5-04 y RF-N-* siguen abiertos.

El coordinador comprobó solo la presencia de las seis variables requeridas por el runner real: todas ausentes. No se ejecutó `test:e2e:real`, no se consultó la API y no se afirma que el servicio esté caído. Sin evidencia externa siguen pendientes integración, cálculos, persistencia, hash, revocación global y autorización del servidor. Las pruebas controladas no sustituyen esos resultados.

La compatibilidad de `displayName` nulo se implementa contra el PATCH parcial local; M6-T1 mantiene pendiente la confirmación del servicio. El traspaso de seguridad está preparado; M6-T5 mantiene pendiente su recepción y respuesta externa.

---
## Antecedente: línea base documental SDD del 2026-10-29

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
