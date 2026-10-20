# Hooks del módulo 2: movimientos

Los hooks de movimientos aíslan el acceso a la API autenticada del estado de presentación. `TransactionsPage` los consume; no son ejemplos desconectados de la aplicación.

## Hooks y responsabilidades

- `useTransactions(filters)` carga la página vigente, cancela solicitudes obsoletas y evita que una respuesta tardía reemplace los datos del filtro actual. Conserva estados de carga, éxito y error, y expone reintento.
- `useCategories(token, expire)` carga las categorías de la sesión, expone alta, edición y eliminación, y vuelve a consultar después de una mutación correcta. Los conflictos HTTP se rechazan para que la interfaz explique, por ejemplo, que una categoría está vinculada a un presupuesto.
- `useTransactionMutations(token, expire, onChanged)` centraliza alta, edición y anulación lógica de movimientos. No envía identidad de usuario: usa el token de sesión; al confirmar una mutación, pide recargar el listado.

Los dos hooks de mutación exponen `isMutating`, no ocultan errores y notifican la expiración cuando la API responde 401. La capa de interfaz traduce errores conocidos a mensajes para la persona usuaria. Importes, estados, fechas y respuestas continúan sujetos a los esquemas Zod del contrato.

## Pruebas

Las pruebas de hooks están junto a su implementación:

- `useCategories.test.ts`: carga y refresco posterior al alta, autorización, expiración y conflicto al eliminar.
- `useTransactionMutations.test.ts`: alta, edición, anulación, autorización, recarga del listado y error de sesión.

Se ejecutan junto con la suite frontend mediante `npm test`, que ya forma parte del workflow de CI del repositorio. No se reporta aquí un despliegue de producción: el despliegue comprobado para este módulo es el entorno local de desarrollo.

## Verificación de esta implementación

En Node 24 se ejecutaron `npm run lint`, `npm run typecheck`, `npm test` y `npm run build`: todos finalizaron correctamente; la suite reportó 32 pruebas aprobadas en 11 archivos. No se modificó el workflow porque ya ejecuta `npm test` y el resto de controles en pushes, pull requests y ejecución manual.
