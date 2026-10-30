# M2 · Gestión de ingresos y gastos
Estado: especificación retrospectiva del frontend; validación integrada pendiente.
Referencia de comportamiento: base 6f4679e, 29 de octubre de 2026.

## Contexto y objetivo
Registrar y consultar ingresos y gastos para mantener un historial financiero organizado.
Eliminar un movimiento significa anularlo y conservarlo en el historial.

## Usuarios
Persona autenticada que administra sus movimientos y sus categorías privadas.

## Historias de usuario
- Como usuario, quiero registrar y corregir un movimiento para mantener mi historial actualizado.
- Como usuario, quiero buscar por texto y período para encontrar registros concretos.
- Como usuario, quiero clasificar mis movimientos para entender su propósito.

## Requisitos funcionales y aceptación
**RF-M2-01 · Registrar, editar y anular.**
- CUANDO el usuario confirma un movimiento válido, EL SISTEMA DEBERÁ solicitar su registro y actualizar la lista tras la confirmación.
- CUANDO el usuario guarda cambios de un movimiento vigente, EL SISTEMA DEBERÁ solicitar la actualización y mostrar los datos confirmados.
- CUANDO el usuario confirma la anulación, EL SISTEMA DEBERÁ solicitarla conservando el historial; el movimiento deberá dejar de contar en el panel según el servicio.
- SI una operación falla, ENTONCES EL SISTEMA DEBERÁ mostrar el error sin presentarla como completada.

**RF-M2-02 · Clasificación por categorías.**
- CUANDO el usuario registra o edita un movimiento, EL SISTEMA DEBERÁ permitir seleccionar una categoría propia o dejarlo sin categoría.
- CUANDO el usuario administra sus categorías, EL SISTEMA DEBERÁ permitir crearlas, renombrarlas y solicitar su eliminación.
- CUANDO el usuario confirma eliminar una categoría, EL SISTEMA DEBERÁ advertir que sus movimientos se conservarán sin categoría.
- SI el servicio rechaza eliminar una categoría vinculada a un presupuesto, ENTONCES EL SISTEMA DEBERÁ mostrar el conflicto.

**RF-M2-03 · Datos del movimiento.**
- CUANDO se registra un movimiento, EL SISTEMA DEBERÁ solicitar tipo ingreso o gasto, importe positivo y fecha con hora; la descripción será opcional.
- SI el importe no tiene dos decimales o es cero, ENTONCES EL SISTEMA DEBERÁ impedir el envío e indicar cómo corregirlo.
- CUANDO existe una descripción, EL SISTEMA DEBERÁ admitir hasta 500 caracteres y descartar espacios de los extremos.

**RF-M2-04 · Búsqueda y filtros.**
- CUANDO el usuario aplica filtros, EL SISTEMA DEBERÁ consultar por fechas opcionales, tipo, estado y texto de descripción o categoría.
- CUANDO se selecciona una fecha final, EL SISTEMA DEBERÁ incluir todo ese día según la hora de Bolivia.
- SI la fecha inicial es posterior a la final, ENTONCES EL SISTEMA DEBERÁ mostrar un error sin aplicar el intervalo.
- CUANDO cambian los filtros aplicados, EL SISTEMA DEBERÁ comenzar en la primera página; cada página solicitará diez movimientos.
- CUANDO no hay coincidencias, EL SISTEMA DEBERÁ mostrar un resultado vacío diferenciado de un error.

## Requisitos no funcionales
- Moneda fija BOB, dos decimales y hasta doce dígitos enteros para los importes.
- Fechas visibles en America/La_Paz; texto y errores en español.
- Carga, fallo y vacío diferenciados; solicitudes vinculadas a la sesión y filtros vigentes.

## Casos límite
Movimiento anulado, categoría ausente o eliminada, rango de un solo día, filtro sin coincidencias, descripción vacía, conflicto y sesión vencida.

## Fuera de alcance
Borrado irreversible de movimientos, importación masiva, recurrencias y multimoneda.

## Criterios de finalización
Los cuatro RF necesitan comprobaciones observables; la conservación real del historial y la exclusión de anulados requieren comprobación externa.
La cobertura parcial de operaciones no demuestra todos los recorridos de pantalla ni todos los filtros.

## Recomendaciones y dudas
RECOMENDACIÓN: mantener la anulación como comportamiento documentado y añadir evidencia para filtros y recorridos completos; no asumir borrado físico.
