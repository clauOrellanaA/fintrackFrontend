# Plan M6 · Usuarios y seguridad
Estado: acceso y perfil presentes; seguridad externa sin acreditar.
Base auditada: 6f4679e; fecha: 2026-10-29.

## Trazabilidad de historias e issues

FE-SDD-03, 2026-10-30. El issue del módulo agrupa sus historias y tareas; permanece abierto hasta acreditar la aceptación completa. Las capacidades y pruebas locales existentes conservan su evidencia.

| Historia | Requisitos | Tareas | Issue |
| --- | --- | --- | --- |
| [HU-M6-01](spec.md#hu-m6-01) | `RF-M6-01` | [M6-T3](tasks.md), [M6-T4](tasks.md), [M6-T6](tasks.md) | [#37](https://github.com/clauOrellanaA/fintrackFrontend/issues/37) |
| [HU-M6-02](spec.md#hu-m6-02) | `RF-M6-02`, `RF-M6-03` | [M6-T1](tasks.md), [M6-T2](tasks.md), [M6-T4](tasks.md), [M6-T5](tasks.md), [M6-T6](tasks.md) | [#37](https://github.com/clauOrellanaA/fintrackFrontend/issues/37) |
| [HU-M6-03](spec.md#hu-m6-03) | `RF-M6-04` | [M6-T3](tasks.md), [M6-T4](tasks.md), [M6-T5](tasks.md), [M6-T6](tasks.md) | [#37](https://github.com/clauOrellanaA/fintrackFrontend/issues/37) |

El detalle de aceptación está en la [spec](spec.md); el estado de cada tarea se conserva en [tasks.md](tasks.md). Un enlace o un issue cerrado no sustituye los resultados por RF.

## Estructura existente y RF
- `src/features/auth/SignInPanel.tsx`: acceso/registro, contraseña oculta y avisos; RF-M6-01/03.
- `src/shared/session/SessionProvider.tsx`: sesión en memoria, normalización, cierre, expiración y generaciones de acceso; RF-M6-01/03/04.
- `src/shared/session/api.ts`: contratos de sesión/perfil y endpoints; RF-M6-01/02/03.
- `src/features/account/UserProfilePage.tsx`: editar perfil y cambiar contraseña; RF-M6-02/03.
- `src/shared/api/http.ts`: Bearer, no-store, errores y timeout; RF-M6-04.
- Páginas financieras muestran SignInPanel sin sesión; hooks aíslan lecturas por token; RF-M6-04.

## Contrato consumido y datos
- `POST auth/register`: email/password/displayName; `POST auth/login`: email/password; RF-M6-01.
- Devuelven accessToken, tokenType Bearer, expiresAt con zona explícita; sesión solo en memoria.
- Correo de acceso/registro con trim/minúsculas; nombre de registro recortado; contraseña nueva 12–1024.
- `DELETE auth/session`: cierra remoto; cliente retira acceso local antes de esperar y avisa si falla; RF-M6-01.
- `GET users/me`: email, displayName nullable, openingBalance, openingDate, currency BOB; RF-M6-02.
- `PATCH users/me`: email/displayName/openingBalance/openingDate; moneda e identidad no editables.
- `POST auth/password`: currentPassword/newPassword; tras éxito cliente elimina sesión y solicita nuevo acceso; RF-M6-03.
- Saldo inicial admite negativo en cadena decimal exacta. Fecha inicial e historial incompatible pueden producir 409.
- Persistencia segura de contraseñas, revocación global y autorización por propietario pertenecen al servicio; RF-M6-03/04.

## Decisiones y alternativa
- Conservar sesión en memoria; alternativa descartada: persistir token en localStorage al adoptar SDD.
- Conservar identidad derivada de Bearer; alternativa descartada: enviar userId elegido desde interfaz.
- No certificar hash ni aislamiento por la apariencia de acceso seguro; alternativa descartada: declarar cerrado el módulo con mocks.
- Conflicto documental: integración permite nombre vacío para cuentas antiguas, pero el formulario usa required y siempre envía displayName; RF-M6-02.
- Recomendación: contrastar esa compatibilidad con el contrato y documentar la decisión antes de cambiar comportamiento.

## Estrategia de comprobación
- `UserProfilePage.test.tsx`: registro, actualización y nuevo acceso tras cambiar contraseña; RF-M6-01/02/03.
- `dashboard/hooks/useDashboard.test.tsx`: cierre inmediato, token no persistido, 401 y sesión anterior; RF-M6-01/04.
- `e2e/dashboard.spec.ts` y `e2e/dashboard-acceptance.spec.ts`: acceso, cierre, teclado y sesión inválida.
- Candidatos: `npm test` y `npm run test:e2e`; NO ejecutados en esta auditoría.
- Suite real del panel compara datos de dos accesos; no prueba solicitudes cruzadas de recursos ni almacenamiento de contraseñas.

## Pendiente y cierre
Consultar [tareas](tasks.md); requieren evidencia externa hash, revocación, acceso cruzado y persistencia.
No inspeccionar ni modificar el repositorio del servicio desde esta sesión frontend.
