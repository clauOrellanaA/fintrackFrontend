# FinanTrack — Frontend

FinanTrack es una aplicación web para organizar y consultar las finanzas personales. Su interfaz permite acceder al panel financiero y consultar, filtrar y administrar movimientos y categorías mediante una API autenticada.

Desarrollado por el equipo **Cosa1ycosa2**: Luciana Salinas y Claudia Orellana.

## Tecnologías y requisitos

El frontend utiliza **React 19, TypeScript y Vite**, con React Router para navegación y Zod para validar datos. El código se organiza por funcionalidades en `src/features`, con componentes y utilidades compartidos en `src/shared`.

Para ejecutarlo necesitas:

- **Node.js 22.12.0 o superior**. La CI utiliza Node.js 24.
- **npm**, incluido con Node.js, para instalar las dependencias del lockfile.
- **Git**, para clonar el repositorio.
- Un navegador moderno y una **API de FinanTrack disponible** para iniciar sesión y consultar datos. En desarrollo, la API debe permitir el origen `http://localhost:5173` mediante CORS y el encabezado `Authorization`.

El navegador consume la API mediante HTTP/JSON; la configuración del backend y de PostgreSQL se realiza por separado.

## Cómo levantar el frontend en local

### 1. Obtener el proyecto e instalar dependencias

```powershell
git clone https://github.com/clauOrellanaA/fintrackFrontend.git
cd fintrackFrontend
npm ci
```

Si ya tienes el repositorio, abre una terminal en su carpeta y ejecuta `npm ci`. En PowerShell puedes usar `npm.cmd` si la política de ejecución bloquea `npm.ps1`.

### 2. Preparar la configuración

```powershell
npm run setup
```

Este comando crea `.env` a partir de `.env.example` si todavía no existe; conserva cualquier configuración existente. La configuración local por defecto es:

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Asegúrate de que la API esté disponible en esa dirección o ajusta la variable a la URL del servicio que vayas a utilizar, incluyendo el prefijo `/api/v1`. Reinicia Vite después de modificarla. Las variables `VITE_*` son públicas en el navegador: no guardes secretos en ellas. `.env` no se versiona.

### 3. Iniciar la aplicación

```powershell
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173). El puerto es fijo y debe estar libre. Para detener el servidor, pulsa `Ctrl+C`.

El inicio de sesión requiere una cuenta existente en la API configurada. La sesión se mantiene en memoria, por lo que al recargar la página debes iniciar sesión nuevamente.

## Usuarios y datos de demostración

Se dispone de dos usuarios de demostración con información financiera ficticia e independiente.

### Credenciales del entorno de demostración en Render

| Usuario | Correo | Contraseña |
| --- | --- | --- |
| Alice | `alice@fintrack.test` | `clavesegura123` |
| Bob | `bob@fintrack.test` | `clavesegura123` |

Estas cuentas corresponden al entorno de demostración en Render. Ejecutar el frontend en local no crea usuarios ni carga datos de prueba: para utilizarlas desde el frontend local, este debe apuntar a la API de demostración y dicha API debe permitir el origen local mediante CORS. Si utilizas un backend local, necesitas cuentas y datos disponibles en ese entorno.

## Comandos útiles

| Comando | Uso |
| --- | --- |
| `npm run dev` | Iniciar el servidor de desarrollo en el puerto 5173. |
| `npm run lint` | Revisar el código con ESLint. |
| `npm run typecheck` | Comprobar los tipos de TypeScript. |
| `npm test` | Ejecutar las pruebas de Vitest. |
| `npm run build` | Comprobar tipos y generar la aplicación en `dist`. |
| `npm run preview` | Previsualizar el build en `http://localhost:4173`. Requiere ejecutar el build antes. |
| `npm run test:e2e` | Ejecutar las pruebas de navegador con Playwright y respuestas de API controladas. |

Para las pruebas de navegador, instala Chromium con `npx playwright install chromium`. La CI ejecuta lint, tipos, pruebas, build y E2E controlados. Las pruebas contra una API real requieren configuración adicional, descrita en la [guía de integración](docs/integration.md).

La previsualización no es un servidor de producción. Si consultas la API desde el puerto 4173, ese origen también debe estar permitido por el servicio.

## Documentación

- [Arquitectura del proyecto](docs/architecture.md).
- [Configuración, autenticación y contrato de integración](docs/integration.md).
- [Hooks de movimientos y categorías](docs/fe-m02-hooks.md).
- [Despliegue en Render, variables y rutas SPA](docs/render-deployment.md).
- [Flujo de contribución y Git](CONTRIBUTING.md).
