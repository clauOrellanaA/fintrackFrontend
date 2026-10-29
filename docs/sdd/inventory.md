# Inventario de capacidades solicitado

Base inspeccionada: `6f4679e62dac6bfd067ca4472413f5dccff8f39d`, 2026-10-29. Alcance: frontend de este repositorio. “Presente” significa encontrado en código; no certifica ejecución ni integración del servicio.

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

Rutas completas, contratos y pruebas candidatas están en los planes de cada módulo. No crear de nuevo CRUD, filtros, informes o metas por ausencia de una spec anterior.

## Deuda documental observada

- `architecture.md` conservaba moneda/zona como pendientes; esta entrega actualiza esa afirmación según los contratos locales.
- `integration.md` describe la posibilidad de dejar el nombre del perfil vacío en cuentas anteriores; el formulario actual exige nombre. Conservar esta discrepancia como pendiente de contraste, sin atribuir al servidor un comportamiento no observado.
- `fe-m02-hooks.md` y documentos de entregas contienen firmas o conteos históricos. Consultar el código de esta base antes de usar esas firmas como contrato actual.
- La gestión de metas no tiene tests propios en esta base. Las pruebas de indicadores del panel no cubren crear/aportar/retirar/archivar.

Las dependencias de persistencia, hash y autorización se solicitan a otra sesión. El backlog compartido informa entregas previas del servidor; no sustituye evidencia de integración en esta base frontend.
