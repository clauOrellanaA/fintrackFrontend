# FE-04: estadísticas e informes

## Alcance implementado

La ruta protegida `/reports` ofrece la vista **Estadísticas e informes**. Con una sesión en memoria activa, permite seleccionar una fecha inicial y una final, consultar el informe del período y presentar:

- comparación de ingresos, gastos y neto;
- distribución de gastos por categoría;
- evolución mensual del saldo;
- corte (`asOf`) y moneda del informe.

Sin sesión, la ruta conserva el flujo de inicio de sesión existente. No se envía ni se acepta `userId` desde la interfaz: la identidad la determina el token Bearer de la sesión.

## Contrato consumido

La consulta es autenticada y relativa a `VITE_API_BASE_URL`:

```http
GET reports?from=YYYY-MM-DD&to=YYYY-MM-DD
Authorization: Bearer <token>
```

La variable pública `VITE_API_BASE_URL` contiene únicamente la base HTTP de la API, incluido el prefijo `/api/v1` cuando corresponda. No deben colocarse tokens, contraseñas ni otros secretos en variables `VITE_*` ni en archivos versionados.

La respuesta se valida con Zod antes de mostrarse:

```ts
type ReportsResponse = {
  period: {
    from: string;
    to: string;
    timeZone: 'America/La_Paz';
    start: string;
    endExclusive: string;
  };
  currency: 'BOB';
  asOf: string;
  comparison: { income: string; expense: string; net: string };
  expenseDistribution: Array<{
    categoryId: string | null;
    categoryName: string;
    amount: string;
    percentage: string;
  }>;
  balanceEvolution: Array<{
    month: string;
    amount: string;
    cutoff: string;
  }>;
};
```

`income`, `expense`, `net` y los importes de ambas listas son cadenas decimales exactas. La interfaz los formatea para BOB sin convertirlos a `number` ni recalcular agregados financieros. Para el gráfico de evolución, la posición visual se determina mediante comparación de cadenas decimales; la tabla contigua conserva y muestra el importe exacto recibido.

La respuesta debe declarar `America/La_Paz`, `BOB`, fechas ISO con zona para `start`, `endExclusive`, `asOf` y `cutoff`, y un rango `period` igual al solicitado. Una respuesta que no cumpla este esquema se trata como inválida y no se representa como datos financieros.

## Flujo y validación del período

Al abrir la vista se propone un intervalo que termina en la fecha actual de Bolivia e inicia el primer día del mes de hace doce meses. El usuario puede cambiar ambas fechas y usar **Actualizar**.

Antes de hacer una nueva consulta, el formulario valida localmente:

- ambas fechas existen y son fechas calendario válidas `YYYY-MM-DD`;
- la fecha inicial es anterior o igual a la final;
- el intervalo inclusivo no supera 24 meses calendario.

Un error se anuncia con `role="alert"`, marca ambos controles con `aria-invalid`, devuelve el foco a la fecha inicial y no realiza una solicitud adicional.

## Estados y errores

- **Carga:** se anuncia un estado ocupado y se muestran esqueletos; las respuestas canceladas, de sesión anterior o de un período anterior no sustituyen el resultado vigente.
- **Datos:** se muestran las tres tarjetas, las barras de distribución y la evolución con fecha de corte.
- **Vacío:** listas vacías de distribución o evolución se indican explícitamente y no se confunden con una carga o con un error.
- **401:** expira la sesión en memoria y devuelve al flujo de acceso; no deja datos del informe visibles.
- **400 `INVALID_REPORT_PERIOD` y 422:** el cliente los clasifica como validación y muestra un mensaje recuperable para revisar el período. El cuerpo de error del servicio no se expone.
- **500 y 503:** se muestran como error recuperable, con botón **Reintentar**. La misma clasificación cubre otros errores de servicio, red, espera agotada, configuración ausente o respuesta inválida con mensajes seguros para la persona usuaria.

Las solicitudes usan `credentials: omit`, `cache: no-store`, cancelación mediante `AbortController` y un tiempo de espera de 10 segundos.

## Gráficos y accesibilidad

La distribución se comunica mediante barras y una lista textual que incluye categoría, importe BOB y porcentaje. El color es decorativo y no es la única señal.

La evolución se presenta como un gráfico de línea con texto alternativo y una tabla con mes, saldo exacto y corte. La línea expresa posición relativa; la tabla es la alternativa accesible y la fuente de los importes exactos. Ambas visualizaciones contemplan sus estados vacíos.

## Archivos relevantes

- `src/app/App.tsx`: registro de la ruta `/reports`.
- `src/app/AppShell.tsx`: acceso de navegación y título de la sección.
- `src/features/reports/api/contract.ts`: esquema y tipo `ReportsResponse`.
- `src/features/reports/api/reports.ts`: cliente `GET reports?from=...&to=...`.
- `src/features/reports/hooks/useReports.ts`: consulta ligada a sesión, cancelación, reintento y expiración por 401.
- `src/features/reports/ReportsPage.tsx`: formulario, tarjetas, gráficos, alternativas textuales y estados visibles.
- `src/features/reports/lib/period.ts`: fechas Bolivia y límite de 24 meses calendario.

## Ejecución y límites de evidencia

Los comandos relevantes de la feature son:

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Evidencia de ejecución confirmada por el coordinador:

| Comando | Resultado |
| --- | --- |
| `npm run lint` | Correcto. |
| `npm run typecheck` | Correcto. |
| `npm test` | Correcto: 17 archivos y 51 pruebas. |
| `npm run build` | Correcto. |
| `npm run test:e2e` | Correcto: 18 pruebas controladas, incluidas las de `e2e/reports.spec.ts` en escritorio y móvil. |

Las pruebas E2E de Reports interceptan respuestas sintéticas de inicio de sesión e informes. La revisión independiente y la comprobación de QA independiente tampoco se completaron, porque sus ejecutores fallaron durante `setup refresh`; por ello estos resultados no sustituyen esa revisión pendiente.

Las pruebas unitarias y los E2E controlados usan respuestas y credenciales sintéticas. Sirven para comprobar el comportamiento local de la interfaz, validación de contrato, accesibilidad y reintento, pero **no acreditan una integración real** con la API de informes ni con PostgreSQL.

La integración real continúa pendiente y requiere un servicio aislado de la API de informes, CORS para el origen de prueba y una cuenta sintética proporcionada por su operador. No se deben usar cuentas, tokens ni datos personales o de producción para esa comprobación.
