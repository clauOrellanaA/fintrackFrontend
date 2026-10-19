# FinanTrack - frontend

Sistema web para la gestion y el control de finanzas personales.

Equipo **Cosa1ycosa2**: Luciana Salinas y Claudia Orellana.

## Estado

FE-00 implementa la base del panel con React + TypeScript + Vite: acceso, sesion en memoria, consulta mensual y estados de carga, error y vacio. Los indicadores y graficos se incorporaran en las siguientes features. Ver [entrega y validaciones pendientes](docs/fe-00-delivery.md).

## Desarrollo local

Requiere Node.js 22.12 o superior (validado con Node 24) y npm. En PowerShell se puede usar `npm.cmd` si la politica de ejecucion bloquea `npm.ps1`.

```powershell
cd C:\fintrack\fintrackFrontend
npm ci
npm run setup
npm run dev
```

Abrir http://localhost:5173. `setup` crea `.env` desde el ejemplo solo si no existe. Iniciar tambien el backend para comprobar la conexion. Si cambia la URL de la API, ajustar `VITE_API_BASE_URL` y reiniciar Vite. El puerto es estricto para conservar el origen CORS acordado. Detener con Ctrl+C.

Verificacion: `npm run lint`, `npm run typecheck`, `npm run build`. Para revisar el build local: `npm run preview` (http://localhost:4173); si se prueba la API desde ese puerto, ajustar temporalmente CORS_ORIGIN del backend y reiniciarlo. Preview no es un servidor de produccion.

Se versionan scripts, configuraciones, `package.json` y `package-lock.json`. `.env`, `node_modules` y `dist` estan excluidos por `.gitignore`. `npm test` ejecuta las pruebas de contrato, sesion y consulta; tambien se ejecutan en CI. Los escenarios `npm run test:e2e` estan preparados, pero su ejecucion y la integracion real con la API siguen pendientes. El acceso requiere un usuario existente en el backend y `VITE_API_BASE_URL` con el prefijo `/api/v1`; al recargar se debe iniciar sesion nuevamente.

## Arquitectura

Frontend: React + TypeScript + Vite, organizado en src/features.
Backend: Node.js + NestJS + TypeScript, organizado en src/modules.
Persistencia: PostgreSQL. Infraestructura prevista: Docker Compose.

Repositorios hermanos: ../fintrackFrontend y ../fintrackBackend. Cada uno tiene historial Git independiente. Los remotos de GitHub deben configurarse cuando se disponga de sus URLs.

Consultar [arquitectura](docs/architecture.md), [integracion](docs/integration.md) y [flujo Git](CONTRIBUTING.md).
