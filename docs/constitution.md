# Constitución de FinanTrack
1. Simplicidad: reutilizar el stack y las convenciones existentes; toda dependencia nueva debe justificar necesidad y alternativa en el plan.
2. Trazabilidad: cada cambio de comportamiento debe actualizar su RF y aceptación; lo reconstruido del código debe identificar su evidencia en el plan.
3. Separación: la interfaz presenta datos y valida entradas; los cálculos financieros y la autorización se contrastan con el contrato de la API.
4. Pruebas: cada comportamiento nuevo o corregido debe tener primero una prueba pertinente; el cierre registra comando, resultado y RF pendientes.
5. Datos: persistir finanzas mediante la API, conservar historial de anulaciones y no almacenar tokens ni contraseñas en almacenamiento persistente del cliente.
6. Idioma: documentación y mensajes al usuario en español; identificadores de código y contrato mantienen el inglés y las convenciones actuales.
