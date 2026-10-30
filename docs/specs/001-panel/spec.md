# M1 · Panel principal
Estado: especificación retrospectiva del frontend; integración real pendiente.
Referencia de comportamiento: base 6f4679e, 29 de octubre de 2026.

## Contexto y objetivo
Reunir las cifras principales para comprender la situación financiera sin recorrer cada registro.
El saldo disponible corresponde al corte comunicado; los resúmenes y gastos corresponden al mes seleccionado.

## Usuarios
Persona con cuenta que consulta exclusivamente su información financiera.

## Historias de usuario
### HU-M1-01

Como usuario, quiero conocer mi saldo y el resultado del mes para decidir mis próximos gastos.

Requisitos: `RF-M1-01`, `RF-M1-02`. Seguimiento: [#31](https://github.com/clauOrellanaA/fintrackFrontend/issues/31).
### HU-M1-02

Como usuario, quiero identificar categorías, presupuestos y metas para reconocer desvíos y avances.

Requisitos: `RF-M1-03`, `RF-M1-04`. Seguimiento: [#31](https://github.com/clauOrellanaA/fintrackFrontend/issues/31).

## Requisitos funcionales y aceptación
**RF-M1-01 · Saldo disponible.**
- CUANDO una consulta devuelve saldo disponible, EL SISTEMA DEBERÁ mostrar su importe en BOB y el corte informado.
- CUANDO el saldo informado es cero o negativo, EL SISTEMA DEBERÁ conservar ese valor sin sustituirlo por el resultado mensual.

**RF-M1-02 · Resumen mensual.**
- CUANDO se abre el panel con sesión, EL SISTEMA DEBERÁ consultar inicialmente el mes actual de Bolivia.
- CUANDO el usuario selecciona otro mes, EL SISTEMA DEBERÁ mostrar por separado los ingresos y gastos de ese mes.
- SI una respuesta corresponde a un mes anterior al seleccionado, ENTONCES EL SISTEMA DEBERÁ impedir que sustituya la consulta vigente.

**RF-M1-03 · Distribución de gastos.**
- CUANDO existen gastos por categoría, EL SISTEMA DEBERÁ mostrar su distribución y una alternativa textual con categoría, importe y porcentaje.
- CUANDO la distribución está disponible y vacía, EL SISTEMA DEBERÁ indicar que no hay gastos para el período.

**RF-M1-04 · Indicadores de presupuestos y metas.**
- CUANDO existen presupuestos, EL SISTEMA DEBERÁ mostrar categoría, límite, consumo, restante, progreso y estado informados.
- CUANDO existen metas, EL SISTEMA DEBERÁ mostrar nombre, objetivo, acumulado, restante, progreso, estado y fecha objetivo cuando exista.
- CUANDO una sección no está disponible, EL SISTEMA DEBERÁ distinguirla de una sección disponible sin registros.
- CUANDO el progreso excede el 100 %, EL SISTEMA DEBERÁ conservar su porcentaje textual real y contener su representación visual.

## Requisitos no funcionales
- Importes exactos en BOB, con dos decimales; meses interpretados en America/La_Paz.
- Carga, error y vacío son estados distintos; el error permite reintentar.
- Gráficos y estados tienen alternativa textual; el color no es el único medio de información.
- La vista se adapta a móvil y escritorio y permite navegación por teclado.
- Las respuestas de otra sesión no deben presentarse como datos de la sesión vigente.

## Casos límite
- Mes sin movimientos, importes máximos admitidos, saldo negativo y nombres largos.
- Presupuesto en 80 %, en 100 % y por encima; metas sin fecha, completadas o vencidas.
- Sección no disponible frente a las cinco secciones disponibles con ceros y listas vacías.
- Sesión vencida, respuesta inválida, fallo de conexión y cambio rápido de mes.

## Fuera de alcance
Edición de registros desde el panel, exportación y notificaciones persistentes.

## Criterios de finalización
Cada RF requiere evidencia de comportamiento; la coincidencia con datos reales requiere validación externa.
El código existente permite documentar la funcionalidad; no acredita por sí solo su cierre integrado.

## Recomendaciones y dudas
No se necesitan preguntas de negocio para registrar este comportamiento.
RECOMENDACIÓN: conservar estas reglas y registrar aparte cualquier cambio futuro; los cálculos externos quedan pendientes de verificación.
