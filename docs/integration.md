# Integración frontend

Estado documental: 2026-10-30 (actualización FE-SDD-02). Este documento describe el contrato consumido por el frontend; no certifica la implementación ni la persistencia del servicio externo.

## Inicio y configuración

Ejecutar `npm ci`, `npm run setup` y `npm run dev` desde el worktree frontend. Se requiere Node >=22.12.0; CI usa Node 24. `npm run setup` prepara la configuración local según `.env.example`. La variable pública `VITE_API_BASE_URL` contiene la base HTTP de la API (para desarrollo, `http://localhost:3000/api/v1`). Todas las variables `VITE_*` se incluyen en el cliente: nunca colocar contraseñas, tokens ni credenciales de PostgreSQL en ellas. No versionar `.env`.

El navegador consulta la API mediante HTTP/JSON; nunca accede directamente a PostgreSQL. El servicio debe admitir el origen del frontend mediante CORS y el encabezado `Authorization`. La configuración y operación del servicio quedan fuera de este repositorio. Las comprobaciones `health` y `health/ready` son diagnósticos; por sí solas no acreditan el funcionamiento del panel.

## Sesión y transporte

| Método y ruta relativa | Contrato consumido |
| --- | --- |
| `POST auth/login` | JSON `{ email, password }`; respuesta `{ accessToken, tokenType: "Bearer", expiresAt }`, con fecha ISO y zona explícita. El correo se normaliza con trim/minúsculas. |
| `POST auth/register` | JSON `{ email, password, displayName }`; correo normalizado, contraseña de 12 a 1024 caracteres y nombre de 1 a 80. Devuelve una sesión activa y `Cache-Control: no-store`. |
| `GET users/me` | Encabezado Bearer; devuelve correo, nombre visible (puede ser null en cuentas anteriores), saldo y fecha inicial, y moneda `BOB`. |
| `PATCH users/me` | Encabezado Bearer; actualiza uno o más campos: `email`, `displayName`, `openingBalance` y `openingDate`. No permite modificar la moneda ni la identidad. |
| `POST auth/password` | Encabezado Bearer y JSON `{ currentPassword, newPassword }`; contraseña nueva de 12 a 1024 caracteres. Devuelve 204 y revoca todas las sesiones. |
| `DELETE auth/session` | Encabezado Bearer; cualquier respuesta HTTP satisfactoria confirma el cierre remoto. |
| `GET dashboard?month=YYYY-MM` | Encabezado Bearer y respuesta agregada descrita abajo. |
| `GET savings-goals` | Lista las metas del usuario, incluidas las archivadas, con objetivo, acumulado, restante, progreso y estado. |
| `POST savings-goals` | Crea una meta con nombre, objetivo BOB y fecha objetivo opcional. |
| `PATCH savings-goals/:id` | Edita la meta o cambia `archived`; no existe borrado destructivo. |
| `POST savings-goals/:id/entries` | Registra un aporte o retiro append-only y devuelve la meta actualizada. |

La sesión se conserva solo en memoria. Al recargar se solicita inicio de sesión. El vencimiento por `expiresAt` o un 401 del panel elimina la sesión; al cerrar sesión los datos desaparecen inmediatamente. Si la revocación remota falla, aparece un aviso de cierre no confirmado. Las consultas canceladas o de una sesión/mes anterior no sustituyen el resultado vigente. Presupuestos, metas y perfil desmontan sus formularios y estado privado al cambiar de token. Las confirmaciones de perfil y contraseña comprueban el token de origen antes de cambiar el correo o cerrar la sesión vigente. El foco vuelve al contenido principal cuando cambia la sesión.

El cliente usa `credentials: omit`, `cache: no-store`, timeout de 10 segundos y validación Zod. Clasifica 400/422 como validación, 401 como sesión vencida, 404 como no encontrado, 409 como conflicto y el resto de errores HTTP como servidor. También distingue configuración ausente, red, timeout y respuesta inválida. No muestra cuerpos de error del servicio.

## Registro, perfil y seguridad

El registro es abierto y no requiere verificación por correo. Una cuenta nueva queda activa de inmediato con nombre visible, saldo inicial `0.00` BOB y fecha inicial correspondiente al día actual de `America/La_Paz`; la respuesta inicia sesión sin guardar el token en almacenamiento persistente. El formulario valida las contraseñas nuevas con un mínimo de 12 caracteres.

La pantalla **Mi cuenta** permite editar el nombre, correo, importe inicial y su fecha. Los importes usan cadenas decimales exactas de dos posiciones. La moneda permanece fija en BOB. Cambiar el saldo modifica los saldos calculados, pero no altera movimientos; la fecha inicial no puede avanzar más allá de movimientos o metas ya existentes y la API responde 409 si el cambio invalidaría ese historial. Para una cuenta antigua cuyo nombre llega nulo o vacío, el formulario permite conservarlo mientras se editan los demás campos: omite `displayName` del PATCH parcial si sigue vacío. Si ya existe nombre, el formulario exige conservar uno no vacío; el registro sigue exigiéndolo. Esta compatibilidad se prueba contra el contrato local; su confirmación en el servicio continúa pendiente en el [traspaso](sdd/service-handoff.md).

El cambio de contraseña exige la contraseña actual. Cuando el servicio confirma el cambio, el cliente borra inmediatamente su sesión en memoria y vuelve al acceso; la API revoca también todas las demás sesiones de esa cuenta. El contrato OpenAPI de estas rutas está versionado en `users.v1.json` en el repositorio backend.

## Respuesta del panel

Fuente ejecutable: `src/features/dashboard/api/contract.ts`. El objeto contiene `period: { month, timeZone, start, endExclusive }`, `currency`, `asOf` y `sections`. La zona admitida es `America/La_Paz`, la moneda `BOB` y las fechas de corte/período son timestamps ISO con zona explícita. El mes recibido debe coincidir con el solicitado y el `cutoff` del saldo disponible debe ser igual a `asOf`.

Cada sección es `{ status: "notAvailable" }` o `{ status: "ready", data }`:

| Sección | Datos cuando está disponible |
| --- | --- |
| `balance` | `{ amount, cutoff }` |
| `monthlySummary` | `{ income, expense }` |
| `expenseDistribution` | Lista `{ categoryId, categoryName, amount, percentage }`; categoría UUID o null. |
| `budgets` | Lista `{ id, categoryId, categoryName, limit, spent, remaining, progress, state }`; UUID y estado `normal`, `warning` o `exceeded`. |
| `savingsGoals` | Lista `{ id, name, target, saved, remaining, progress, state, targetDate }`; UUID, estado `active`, `completed` o `overdue`, fecha `YYYY-MM-DD` o null. |

Los importes llegan como cadenas decimales con dos posiciones y hasta doce dígitos enteros, con signo negativo opcional. Porcentajes/progresos son cadenas no negativas con dos decimales. El frontend formatea los importes en BOB sin recomputar agregados financieros; consume los estados y porcentajes del servicio. La autorización por propietario y los cálculos corresponden a la API y requieren validación externa.

## Flujo y estados visibles

Sin sesión se muestra el formulario de acceso. Con sesión se consulta el mes actual de Bolivia, se puede cambiar el mes o actualizar. La carga tiene anuncio accesible y esqueletos; los errores ofrecen reintento. Una respuesta válida muestra mes y corte, saldo, ingresos/gastos, distribución, presupuestos y metas. Cada tarjeta distingue datos disponibles, lista vacía y sección no disponible; un panel totalmente vacío requiere las cinco secciones disponibles, importes cero y listas vacías. `notAvailable` no equivale a cero.

Los indicadores incluyen texto y alternativas accesibles, además de color. Las metas y presupuestos muestran montos, progreso y estado. El diseño móvil adapta las tarjetas a una columna y permite importes/nombres largos; los E2E controlados incluyen 320 px. Las rutas de transacciones/presupuestos y sus operaciones son features separadas. La pantalla de gestión de metas y sus estados están documentados en [FE-07](fe-07-savings-goals.md); FE-06 conserva únicamente el contrato de indicadores del dashboard.

## Verificación controlada y real

`npm test` ejecuta Vitest. `npm run test:e2e` ejecuta Playwright desktop/mobile con respuestas de API controladas: comprueba comportamiento del navegador, no una conexión real ni PostgreSQL. Instalar Chromium con `npx playwright install chromium` si falta. Las capturas en `docs/previews` proceden de datos sintéticos y sirven como evidencia visual local.

`npm run test:e2e:real` usa `playwright.real.config.ts`, sin interceptar la API ni crear datos. Requiere un servicio aislado y dos cuentas sintéticas distintas, proporcionadas por su operador. El runner necesita estas variables de entorno:

| Variable | Uso |
| --- | --- |
| `FINTRACK_TEST_API_URL` | Base HTTP(S), sin credenciales, query ni fragmento. |
| `FINTRACK_TEST_MONTH` | Mes de consulta `YYYY-MM`. |
| `FINTRACK_TEST_EMAIL_A`, `FINTRACK_TEST_EMAIL_B` | Identificadores de dos cuentas sintéticas distintas. |
| `FINTRACK_TEST_PASSWORD_A`, `FINTRACK_TEST_PASSWORD_B` | Contraseñas de prueba, solo en el entorno del runner; nunca `VITE_*`. |

Inyectar las seis variables desde el gestor de secretos o entorno de la terminal y ejecutar únicamente:

```powershell
npm run test:e2e:real
```

No escribir credenciales literales en comandos, documentos o archivos versionados. El runner inicia Vite en `http://localhost:5175`; ese origen debe estar permitido por la API y el puerto libre. Desactiva trazas, capturas y vídeo. Inicia/cierra ambas sesiones y compara tarjetas y filas con la respuesta API del mes solicitado; no hace escrituras financieras, seeds ni acceso directo a persistencia. Requiere todas las secciones `ready`. Las listas vacías son contractualmente válidas, pero para acreditar estados de presupuestos/metas hace falta un dataset poblado representativo.

La suite falla de forma temprana si faltan parámetros; ese fallo no es evidencia de integración aprobada. La CI ordinaria ejecuta la suite controlada, no la real. En FE-SDD-02 se comprobó únicamente la presencia de las seis variables del runner: ninguna estaba configurada. No se ejecutó la suite real ni se consultó la API; el diagnóstico de conexión de entregas anteriores es histórico y no demuestra disponibilidad actual. Obtener confirmación de aislamiento, cuentas y dataset del operador y registrar evidencia antes de cerrar la integración. Notificaciones sigue sin contrato confirmado ni implementación; la [solicitud preparada para el servicio](sdd/service-handoff.md) detalla cómo desbloquearla.
