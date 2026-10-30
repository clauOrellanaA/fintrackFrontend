# M5 · Metas de ahorro y alertas
Estado: gestión de metas presente en frontend; notificaciones centrales pendientes.
Referencia de comportamiento: base 6f4679e, 29 de octubre de 2026.

## Contexto y objetivo
Definir objetivos de ahorro y registrar avances y retiros para conocer lo acumulado.
Los indicadores existentes muestran estados; una bandeja persistente de notificaciones todavía no está implementada.

## Usuarios
Persona autenticada que administra sus objetivos de ahorro.

## Historias de usuario
- Como usuario, quiero crear una meta con importe y fecha opcional para planificar mi ahorro.
- Como usuario, quiero registrar aportes o retiros para seguir el progreso.
- Como usuario, quiero recibir avisos sobre presupuestos y objetivos para reconocer cambios relevantes; esta historia permanece pendiente.

## Requisitos funcionales y aceptación
**RF-M5-01 · Creación y gestión de metas.**
- CUANDO el usuario crea una meta válida, EL SISTEMA DEBERÁ solicitar su registro y actualizar la lista tras su confirmación.
- CUANDO el usuario edita una meta, EL SISTEMA DEBERÁ permitir cambiar nombre, objetivo y fecha objetivo.
- CUANDO el usuario archiva o restaura una meta, EL SISTEMA DEBERÁ solicitar el cambio sin ofrecer borrado destructivo.
- CUANDO se consultan metas, EL SISTEMA DEBERÁ mostrar también las archivadas e identificarlas como tales.

**RF-M5-02 · Objetivo y fecha.**
- CUANDO se guarda una meta, EL SISTEMA DEBERÁ exigir un nombre de 1 a 100 caracteres tras quitar espacios extremos y un objetivo positivo BOB con dos decimales.
- CUANDO el usuario deja la fecha vacía, EL SISTEMA DEBERÁ aceptar una meta sin fecha objetivo.
- SI el importe es cero, negativo o tiene un formato incorrecto, ENTONCES EL SISTEMA DEBERÁ impedir el envío e indicar el error.

**RF-M5-03 · Registro del progreso.**
- CUANDO se muestran metas, EL SISTEMA DEBERÁ presentar objetivo, acumulado, restante, porcentaje y estado informado: en progreso, completada o vencida.
- CUANDO el usuario registra un aporte o retiro, EL SISTEMA DEBERÁ exigir un importe positivo con dos decimales y actualizar la consulta tras la confirmación.
- MIENTRAS una meta está archivada, EL SISTEMA DEBERÁ ocultar las acciones de aportar y retirar.
- SI el servicio rechaza un retiro incompatible con el acumulado, ENTONCES EL SISTEMA DEBERÁ comunicar el conflicto sin informar éxito.
- CUANDO el porcentaje supera el 100 %, EL SISTEMA DEBERÁ conservar el valor textual y contener su barra visual.

**RF-M5-04 · Notificaciones internas — pendiente.**
- CUANDO se produzca un evento de presupuesto u objetivo definido para notificación, EL SISTEMA DEBERÁ mostrar un aviso dentro de la aplicación.
- Este criterio describe la necesidad solicitada; su comportamiento detallado es una recomendación planificada en el [roadmap](../../sdd/roadmap.md), sin evidencia de implementación actual.

## Requisitos no funcionales
- BOB con dos decimales; fecha objetivo sin desplazamiento de día por zona del dispositivo.
- Carga, error y lista vacía diferenciados; operaciones vinculadas a la sesión.
- Estados y progreso legibles como texto, además de su representación visual.

## Casos límite
Meta sin fecha, sin aportes, completada, excedida, vencida o archivada; retiro superior al acumulado.
Nombre vacío, objetivo cero, fallo de operación, cambio de sesión y respuesta tardía.

## Fuera de alcance
Borrado irreversible de metas, eliminación de aportes, transferencias entre metas y avisos por correo o sistema operativo.

## Criterios de finalización
RF-M5-01 a RF-M5-03 requieren pruebas propias de gestión: su presencia en código no acredita una aceptación ejecutada.
RF-M5-04 permanece pendiente; el módulo global no está cerrado mientras falten sus notificaciones y validación integrada.

## Recomendaciones y dudas
RECOMENDACIÓN: reutilizar las reglas actuales y cerrar primero la cobertura de gestión; resolver el contrato externo de notificaciones en una sesión de la capa correspondiente.
