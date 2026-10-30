# Inventario de capacidades solicitado

Base de FE-SDD-02: `e9e6bd4d3c9a36c02d3e7e41cc58a9a2c5d01983` más el diff del worktree `fe-sdd-02-spec-completion`, 2026-10-30. La línea base documental anterior inspeccionó `6f4679e` el 2026-10-29. “Presente” describe implementación; los resultados ejecutados y sus límites se registran en [verificación](verification.md). No certifica integración del servicio.

| Módulo / RF | Capacidad solicitada | Estado observado | Evidencia principal |
| --- | --- | --- | --- |
| RF-M1-01 | Saldo disponible | Presente | `BalanceCard.tsx`, respuesta dashboard |
| RF-M1-02 | Ingresos y gastos mensuales | Presente | `MonthlySummaryCards.tsx` |
| RF-M1-03 | Distribución de gastos | Presente | `ExpenseDistribution.tsx`, alternativa textual |
| RF-M1-04 | Indicadores de presupuesto y ahorro | Presente | `BudgetIndicators.tsx`, `SavingsGoalsCard.tsx` |
| RF-M2-01 | Registrar, editar y eliminar movimientos | Presente; eliminar anula y conserva historial | `TransactionsPage.tsx`, `voidTransaction` |
| RF-M2-02 | Clasificar por categoría | Presente, incluso gestión de categorías | `useCategories.ts`, cliente de categorías |
| RF-M2-03 | Fechas, importes y descripciones | Presente | Formulario de movimientos y esquema de respuesta |
| RF-M2-04 | Buscar y filtrar por período/tipo | Presente; también estado y paginación | `useTransactions.ts`, `listTransactions` |
| RF-M3-01 | Límites mensuales | Presente | `BudgetsPage.tsx` |
| RF-M3-02 | Presupuesto por categoría | Presente | `CreateBudgetInput` |
| RF-M3-03 | Porcentaje usado | Presente, recibido del servicio | Tarjetas de presupuesto |
| RF-M3-04 | Alertas 80 % / superar límite | Presente como indicador en la vista | Estados normal/warning/exceeded; no notificación persistida |
| RF-M4-01 | Comparar ingresos/gastos | Presente | `ReportsPage.tsx`, comparison |
| RF-M4-02 | Distribución por categoría | Presente | expenseDistribution |
| RF-M4-03 | Evolución mensual de saldo | Presente | balanceEvolution, gráfico y tabla |
| RF-M4-04 | Informes por fechas | Presente; máximo 24 meses calendario | `reports/lib/period.ts` |
| RF-M5-01 | Crear objetivos de ahorro | Presente en base actualizada | `SavingsGoalsPage.tsx` |
| RF-M5-02 | Montos y fechas objetivo | Presente; fecha opcional | Formulario y contrato de metas |
| RF-M5-03 | Registrar progreso | Presente; aportes y retiros | `addSavingsEntry`, `useSavingsGoals.ts` |
| RF-M5-04 | Notificaciones dentro de la app | Pendiente de interfaz y contrato local | No hay pantalla/cliente de notificaciones; avisos inline no cubren bandeja |
| RF-M6-01 | Registro e inicio de sesión | Presente en interfaz | `SignInPanel.tsx`, SessionProvider |
| RF-M6-02 | Perfil | Presente | `UserProfilePage.tsx` |
| RF-M6-03 | Protección de contraseñas | Parcial verificable en cliente | Campo protegido, cambio y sesión en memoria; hash requiere evidencia externa |
| RF-M6-04 | Datos financieros propios | Parcial verificable en cliente | Bearer y limpieza por sesión; autorización y aislamiento requieren API real |

Rutas completas, contratos y pruebas están en los planes de cada módulo y en la matriz vigente de verificación. No crear de nuevo CRUD, filtros, informes o metas por ausencia de una spec anterior.

## Actualización FE-SDD-02

- Metas dispone de pruebas propias de creación, edición, aportes/retiros, archivo/restauración, errores y sesión; las tarjetas del panel ya no son su única cobertura.
- Movimientos añade pruebas de pantalla y `useTransactions`: validaciones, categorías, filtros/paginación, carga/vacío/error y respuestas tardías.
- Presupuestos cubre límites/categorías, estados recibidos 79,99/80/100/>100, cancelación/fallo de eliminación, mes vacío y cambio de sesión.
- Cuenta añade regresiones de respuestas tardías de perfil/contraseña y pruebas del proveedor de sesión. El nombre legado vacío se conserva omitiéndolo del PATCH parcial; el contraste con el servicio sigue pendiente.
- Las correcciones desmontan formularios privados por token e impiden que una confirmación de la cuenta anterior cambie o cierre la nueva sesión. Informes vuelve a consultar al actualizar sin cambiar fechas.
- La ejecución final de estas comprobaciones se registra en [verificación](verification.md); los documentos de entregas anteriores conservan sus firmas y conteos históricos.

Notificaciones no tiene contrato confirmado ni implementación. La [solicitud al servicio](service-handoff.md) está preparada, sin afirmar que otra sesión la haya recibido. Persistencia, hash, revocación global, cálculos y autorización del servidor requieren evidencia externa. Las seis variables del runner real estaban ausentes; no se consultó la API ni se afirma que el servicio esté caído.
