# M3 · Gestión de presupuestos
Estado: especificación retrospectiva del frontend; validación integrada pendiente.
Referencia de comportamiento: base 6f4679e, 29 de octubre de 2026.

## Contexto y objetivo
Definir límites mensuales por categoría y reconocer cuánto se ha consumido.
Las advertencias actuales se muestran junto a cada presupuesto; no constituyen una bandeja de notificaciones.

## Usuarios
Persona autenticada que planifica y revisa sus límites de gasto.

## Historias de usuario
- Como usuario, quiero asignar un límite mensual a una categoría para controlar mis gastos.
- Como usuario, quiero reconocer acercamientos y excesos para ajustar mis decisiones.

## Requisitos funcionales y aceptación
**RF-M3-01 · Límites mensuales.**
- CUANDO el usuario crea un presupuesto, EL SISTEMA DEBERÁ solicitar un mes válido y un límite positivo en BOB con dos decimales.
- CUANDO el usuario edita un presupuesto, EL SISTEMA DEBERÁ permitir cambiar su límite.
- CUANDO el usuario confirma eliminarlo, EL SISTEMA DEBERÁ solicitar la eliminación del límite sin modificar los movimientos.
- SI el servicio rechaza una operación, ENTONCES EL SISTEMA DEBERÁ comunicar el error y conservar visible la posibilidad de corregirlo.

**RF-M3-02 · Asignación por categoría.**
- CUANDO se crea un presupuesto, EL SISTEMA DEBERÁ exigir una categoría propia.
- CUANDO no existen categorías disponibles, EL SISTEMA DEBERÁ impedir la creación y orientar al usuario para crear una.
- SI el servicio informa un presupuesto duplicado para categoría y mes, ENTONCES EL SISTEMA DEBERÁ mostrar el conflicto.
- MIENTRAS se edita un presupuesto existente, EL SISTEMA DEBERÁ mantener su categoría y mes.

**RF-M3-03 · Seguimiento del consumo.**
- CUANDO el usuario consulta un mes, EL SISTEMA DEBERÁ mostrar categoría, gastado, límite, restante y porcentaje informados para ese mes.
- CUANDO el porcentaje supera el 100 %, EL SISTEMA DEBERÁ conservar el porcentaje real en texto y contener la barra visual.
- CUANDO el restante es negativo, EL SISTEMA DEBERÁ identificarlo como exceso.
- CUANDO no hay presupuestos en el mes, EL SISTEMA DEBERÁ mostrar un estado vacío.

**RF-M3-04 · Advertencias de umbral.**
- CUANDO el servicio informa estado normal, EL SISTEMA DEBERÁ mostrar la etiqueta “En rango”.
- CUANDO el servicio informa advertencia por consumo desde el 80 % hasta el límite, EL SISTEMA DEBERÁ mostrar “Atención” y el aviso de uso de al menos el 80 %.
- CUANDO el servicio informa que se superó el límite, EL SISTEMA DEBERÁ mostrar “Excedido” y el aviso correspondiente.
- MIENTRAS muestra estos estados, EL SISTEMA DEBERÁ conservar la clasificación recibida; la determinación exacta de los umbrales requiere validación del servicio.

## Requisitos no funcionales
- BOB con dos decimales; período mensual de Bolivia.
- Etiquetas y avisos textuales además del color.
- Carga, error, vacío y sesión vencida diferenciados; el fallo de consulta permite reintentar.

## Casos límite
Sin categorías, categoría eliminada, presupuesto duplicado, límite cero o mal formado y cambio rápido de mes.
Consumos de 79,99 %, 80 %, 100 % y más de 100 %; el 100 % exacto no significa superar el límite.

## Fuera de alcance
Presupuesto global sin categoría, copia automática entre meses y notificaciones persistentes.

## Criterios de finalización
Los RF necesitan evidencia de creación, edición, eliminación y visualización de los estados.
La clasificación de umbrales y el consumo real no quedan certificados por una presentación con datos controlados.

## Recomendaciones y dudas
RECOMENDACIÓN: conservar las alertas visibles actuales y tratar las notificaciones como alcance separado del [roadmap](../../sdd/roadmap.md).
