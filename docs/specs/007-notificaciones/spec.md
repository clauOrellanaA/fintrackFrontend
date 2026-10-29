# Notificaciones dentro de la aplicación

Estado: RECOMENDACIÓN de funcionalidad pendiente. Completa RF-M5-04; no describe una capacidad existente ni acredita el servicio.

## Contexto y objetivo

Los indicadores actuales requieren visitar cada pantalla. Una bandeja permite consultar avisos de presupuestos y metas y conservar cuáles se han leído. El MVP evita que una recarga produzca alertas duplicadas.

## Usuarios e historias

Persona autenticada que gestiona sus finanzas:
- Como usuario, quiero consultar avisos para identificar presupuestos en riesgo y cambios relevantes de mis metas.
- Como usuario, quiero distinguir y marcar avisos leídos para saber cuáles me quedan por revisar.

## Requisitos y aceptación EARS

- **RF-N-01 — Consultar avisos propios.** CUANDO el usuario abra la bandeja o solicite actualizar, el sistema DEBE mostrar sus avisos desde el más reciente, con tipo, mensaje, fecha y estado de lectura. SI no hay avisos, DEBE indicar que la bandeja está vacía.
- **RF-N-02 — Presupuestos.** CUANDO un presupuesto alcance por primera vez al menos 80 % sin superar su límite durante un mes, el sistema DEBE conservar un aviso de atención. CUANDO supere 100 %, DEBE conservar un aviso de exceso. SI pasa directamente desde menos de 80 % a más de 100 %, DEBE generar solo el aviso de exceso para ese cambio. MIENTRAS permanezca en la misma condición, DEBE evitar repetir el mismo tipo de aviso para ese presupuesto y mes.
- **RF-N-03 — Metas.** CUANDO una meta se complete o venza sin completar según la fecha de Bolivia, el sistema DEBE conservar un aviso del tipo correspondiente. SI se vuelve a consultar o editar la meta, DEBE conservar un solo aviso por meta y tipo en este MVP. MIENTRAS esté archivada, DEBE conservar los avisos existentes y no generar nuevos.
- **RF-N-04 — Lectura.** CUANDO el usuario marque un aviso como leído y se confirme la operación, el sistema DEBE conservar su estado entre visitas y sesiones. SI la operación falla, DEBE mantenerlo sin leer y explicar el fallo. CUANDO repita una confirmación ya realizada, DEBE mantener el mismo resultado.
- **RF-N-05 — Sesión y fallos.** SI la sesión no es válida, el sistema DEBE solicitar acceso y retirar los avisos privados. SI ocurre un fallo de consulta, DEBE mostrar error y reintento sin presentarlo como bandeja vacía. CUANDO cambie el usuario, DEBE evitar mostrar avisos o resultados tardíos del anterior.

## Requisitos no funcionales

Mensajes y etiquetas en español; tipos distinguibles mediante texto además de color; apertura, actualización y lectura operables por teclado; fechas legibles en Bolivia; confirmación de lectura persistida por el servicio; ningún token persistido en el cliente.

## Casos límite

80 % exacto y 100 % exacto producen atención, más de 100 % produce exceso; presupuesto nuevo que ya supera el límite sigue la regla de exceso; una meta vencida ya completada no genera aviso de vencimiento nuevo; el historial previo permanece al cambiar o archivar entidades; dos avisos simultáneos se muestran en un orden estable; confirmaciones de lectura repetidas no duplican avisos.

## Fuera de alcance

Correo, SMS, push, avisos en segundo plano del navegador, tiempo real, preferencias configurables, borrar avisos, marcar todos y navegación directa hacia una entidad. No se reconstruye el historial anterior a activar esta funcionalidad.

## Criterios de finalización

RF-N-01..05 comprobados con pruebas controladas y API real aislada; persistencia y separación de usuarios acreditadas externamente; se conserva el comportamiento de los indicadores existentes. La planificación y una interfaz con respuestas sintéticas no completan RF-M5-04 globalmente.

## Decisiones recomendadas

Bandeja persistida, actualización manual y deduplicación por entidad/tipo (también mes en presupuesto). Son recomendaciones adoptadas para poder planificar sin cuestionario; deben contrastarse con el contrato del servicio antes de construir. La generación de avisos no depende de mantener abierta la bandeja.
