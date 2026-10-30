# Plan de trabajo y pendientes

Actualizado en FE-SDD-02, 2026-10-30, sobre `e9e6bd4` más el diff del worktree. Se conservan las capacidades presentes. La evidencia vigente está en [verificación](verification.md); las casillas de cada módulo distinguen cierre local y dependencia externa.

| Entrega | Estado FE-SDD-02 | Próximo paso |
| --- | --- | --- |
| Gestión de metas RF-M5-01/02/03 | Cobertura propia añadida y privacidad por sesión corregida | QA local aprobada; contrastar operaciones con API aislada |
| Movimientos y presupuestos RF-M2-*, RF-M3-* | Pruebas de pantalla/hooks ampliadas; presupuesto sin mes y formularios entre sesiones corregidos | QA local aprobada; validar cálculos/mutaciones reales |
| Perfil y sesión RF-M6-* | Confirmaciones antiguas protegidas por token; compatibilidad local de nombre vacío; pruebas de errores/expiración/cierre | Confirmación externa de perfil antiguo, hash, revocación y acceso cruzado |
| Panel e informes RF-M1-*, RF-M4-* | Mapas sintéticos de integración preparados; Actualizar informes con mismo rango corregido | QA controlada aprobada; ejecutar recorridos reales |
| Contrato de notificaciones RF-M5-04, RF-N-* | Propuesta y traspaso preparados, sin confirmación del servicio | Entregar [solicitud](service-handoff.md) en la sesión del servicio y recibir contrato versionado |
| Bandeja de notificaciones | Sin implementación, dependiente del contrato anterior | Escribir pruebas e implementar lista/lectura/paginación una vez confirmado |
| Integración de los seis módulos | Pendiente | API aislada, dos cuentas sintéticas, dataset y resultados reales por RF |

Las tareas de 20–30 minutos se conservan en `docs/specs/001-panel/tasks.md` a `007-notificaciones/tasks.md`. Una prueba controlada no cierra un requisito de persistencia o autorización del servidor.

## Decisiones recomendadas para notificaciones

**Propuesta, todavía sin implementar ni confirmar:** bandeja persistida con estado leído/no leído; avisos de presupuesto al 80 % y al superar 100 %, meta completada y meta vencida sin completar. El servicio determina estados y evita duplicados; el cliente no infiere eventos desde porcentajes del panel.

Una notificación por usuario/presupuesto/mes/tipo y por usuario/meta/tipo en el MVP. Reabrir o editar una meta no vuelve a emitir el mismo tipo. Un salto directo desde menos de 80 % a más de 100 % genera únicamente exceso para ese cambio. Conservar avisos históricos y calendario `America/La_Paz`.

Sin correo, push, SMS, tareas del navegador en segundo plano ni tiempo real. Consultar al entrar, actualizar manualmente y paginar; sin polling o websocket. Confirmar estas decisiones en el contrato externo antes de consumir las rutas propuestas.

## Dependencias concretas

El [traspaso al servicio](service-handoff.md) reúne rutas, ejemplos, errores y aceptación de generación/deduplicación/lectura, junto con los casos de seguridad y el entorno de integración. Preparar este documento no demuestra recepción ni ejecución por otra sesión.

Se comprobó que las seis variables `FINTRACK_TEST_*` del runner real no están configuradas. No se ejecutó API real ni se administró la otra capa. El runner disponible solo cubre lectura del panel; gestión, informes, notificaciones, persistencia y rechazo de escrituras ajenas necesitan evidencia adicional. La disponibilidad actual del servicio no se ha consultado.
