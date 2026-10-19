# FE-00: base del panel principal

Base origin/dev `b9e7fa3fb397133559e5d549401d660b9f75f0ca`. Rama `feature/fe-00-dashboard-foundation`, worktree `C:/fintrack/worktrees/frontend/fe-00-dashboard-foundation`. Responsable unico de escritura y Git: coordinador. No se cambia la rama del IDE ni se mezclan sus cambios locales. Sin merge ni despliegue.

## Alcance implementado

React conserva tokens CSS existentes: lavanda, superficies blancas, sidebar clara y acentos violetas inspirados en la referencia del usuario. Iconos Lucide; React Router para /dashboard, redireccion desde / y estado de ruta inexistente. Adaptacion CSS de escritorio/tablet/movil, foco visible, salto al contenido, navegacion movil y movimiento reducido. No se afirma verificacion visual ejecutada.

Acceso minimo con POST /auth/login y cierre DELETE /auth/session; token solo en memoria, nunca localStorage/sessionStorage/URL. No hay registro, recuperacion ni gestion de perfiles. Al recargar es necesario ingresar otra vez. Rechazo 401 o expiracion local descartan el acceso. Logout descarta datos locales antes de esperar revocacion y avisa si no pudo confirmarla.

Cliente HTTP compartido: URL VITE_API_BASE_URL, bearer, errores separados de red/timeout/validacion/sesion/servidor/respuesta invalida y cancelacion. No interpreta fallos como resultados vacios. Timeout10s cubre fetch y lectura de respuesta. No se envia userId. Runtime Zod y tipos inferidos propios de dashboard preservan dinero como cadena exacta y distinguen ready/notAvailable. No hay calculos financieros ni Number monetario.

Contrato consumido: GET /api/v1/dashboard?month=YYYY-MM; copia de OpenAPI backend commit21d2288 en docs/contracts/dashboard.v1.json, sin modificar el origen. Periodo por defecto America/La_Paz y selector mensual compatible con D02; saldo mantiene corte asOf independiente. El hook cancela peticiones y usa version de solicitud/ambito de sesion para impedir sobrescrituras tardias. No se incorpora cache de consultas; al cerrar sesion se desmonta el contenido privado.

La pagina diferencia acceso, carga, error/reintento, consulta exitosa y vacio real del panel. Campos ausentes o notAvailable no se convierten en cero. Las areas futuras son explicitamente pendientes: FE-01 saldo, FE-02 resumen, FE-03 grafico, FE-04 presupuestos y FE-05 metas. No hay cifras ni segmentos ficticios ni fallback de demostracion en la aplicacion.

## Propiedad y siguientes entregas

AppShell/App/rutas, SessionProvider, cliente HTTP, estilos base, dependencias y composicion DashboardPage tienen un unico escritor coordinador. Cada feature siguiente puede aportar su componente/hook dentro de dashboard; la composicion y utilidades compartidas se integran de forma serial mediante PR a dev. Las APIs de movimientos y sus entidades siguen siendo responsabilidad del modulo2; esta entrega no modifica backend.

## Validacion y pendientes explicitos

- Quince pruebas Vitest/Testing Library aprobadas: contrato de todos los ejemplos backend, dinero exacto, bearer/periodo sin userId, errores, cancelacion/timeout, periodo en Bolivia, respuesta tardia de otro mes/cuenta, sesion invalida, logout privado, reintento y recorrido visible acceso/carga/vacio/cierre.
- Lint, chequeo de tipos y build aprobados. CI incorpora npm test. Estado remoto se informa al publicar.
- Seis escenarios Playwright preparados (tres en escritorio y movil) con respuestas controladas solo en pruebas. **No ejecutados**: la solicitud de ejecutar Chromium/servidor local fue rechazada. No hay capturas ni inspeccion visual confirmadas.
- **Integracion real API/PostgreSQL pendiente**: la solicitud de iniciar el contenedor aislado fue rechazada. No se uso la base local del usuario ni se afirma sesion/consulta real validada extremo a extremo. FE-00 no se considera cerrada hasta verificar este criterio.

Dependencias nuevas: react-router-dom, Zod y lucide-react; pruebas con Vitest, Testing Library/jsdom y Playwright, fijadas en lockfile. No se agrega una libreria de cache o de graficos. Las pruebas controladas no acreditan integracion real. La entrega queda implementada para revision, con esas dos validaciones pendientes.
