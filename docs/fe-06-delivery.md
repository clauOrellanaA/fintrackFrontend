# Entrega FE-06: integración del panel

Fecha: 2026-10-19. Repositorio: fintrackFrontend. Rama: `feature/fe-06-dashboard-integration`. Base: `origin/dev`, SHA `ab99e00d8246a9db77c7e8d86a56a74e119ce229`. Worktree: `C:/fintrack/worktrees/frontend/fe-06-dashboard-integration`. Responsable único de Git: coordinador `/root`.

## Alcance entregado

El panel consume sesión Bearer y el agregado mensual validado, presenta saldo, resumen, distribución, presupuestos y metas, y distingue carga, error/reintento, vacío y secciones no disponibles. Las consultas quedan vinculadas a la sesión y al mes; cerrar/cambiar sesión elimina datos anteriores. FE-06 refuerza el foco al cambiar sesión y el diseño móvil para importes largos, tarjetas de una columna y metas de ancho completo.

La suite E2E controlada cubre escritorio/móvil, estados del panel, cambio de mes, sesión, respuestas tardías y tamaños extremos, incluido 320 px. La suite opt-in real compara las tarjetas y filas con respuestas de dos sesiones sintéticas sin mocks ni escrituras financieras. Consultar [integración](integration.md) para contrato, configuración y requisitos.

## Evidencia local recibida

Evidencia comunicada por el coordinador y responsables; no ejecutada por el documentador:

| Comprobación | Resultado comunicado |
| --- | --- |
| `npm ci` | Correcto; auditoría con 0 vulnerabilidades. |
| `npm test` | 34/34 aprobados. |
| `npm run lint`, `npm run typecheck` | Aprobados por el responsable de tests. |
| `npm run build` | Aprobado por el responsable de implementación. |
| `npm run test:e2e` | 16/16 aprobados por el responsable de tests, desktop/mobile. |
| Revisión independiente | Hallazgo P2 de suite real corregido y rerevisado; sin nuevos bloqueantes. |

QA final repitió `npm run lint`, `npm run typecheck`, `npm test` (13 suites, 34 pruebas), `npm run build` y `npm run test:e2e` (16/16 Chromium desktop/mobile): todos finalizaron con exit 0, en Node 24.15.0 y npm 11.12.1. Comprobó por teclado el foco tras login en el contenido principal y el acceso a actualizar; logout/401 verificaron contenido, sin una aserción específica del foco. La suite real terminó con exit 1 por sus seis variables ausentes: no se ejecutó la integración real. El diagnóstico HTTP con timeout de cinco segundos falló por conexión. La inspección visual confirmó metas móviles legibles a ancho completo y gasto compacto; el espacio blanco bajo métricas en escritorio no se consideró bloqueante. Las capturas de `docs/previews` usan un baseline sintético y no acreditan integración real. No se afirma CI remota aprobada, merge ni despliegue.

## Aceptación pendiente

El usuario indicó `http://localhost:3000/api/v1`. El coordinador informó fallo de conexión al consultar `health/ready`; el usuario no conoce las cuentas sintéticas. No se ha acreditado una ejecución real contra PostgreSQL de pruebas.

Para cerrar: el operador debe proporcionar una API aislada disponible y dos sesiones sintéticas con datos representativos del mes, permitir el origen `http://localhost:5175` y ejecutar `npm run test:e2e:real` con las seis variables documentadas. Deben comprobarse importes/filas/estados y la separación de datos entre sesiones. Las listas `ready: []` son válidas, pero no ejercitan estados poblados. No basta con el fail-fast de parámetros ni con pruebas simuladas. El cierre de FE-06 y del módulo 1 permanece pendiente de esa evidencia.
