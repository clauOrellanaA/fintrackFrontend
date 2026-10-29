# M6 · Usuarios y seguridad
Estado: flujos de acceso y perfil presentes; protección y aislamiento externos pendientes de acreditación.
Referencia de comportamiento: base 6f4679e, 29 de octubre de 2026.

## Contexto y objetivo
Ofrecer acceso personal y administración de cuenta para mantener información financiera privada.
La interfaz controla la sesión visible; la protección real de credenciales y la autorización de datos dependen del servicio.

## Usuarios
Persona que registra una cuenta y persona autenticada que administra su perfil.

## Historias de usuario
- Como visitante, quiero registrarme o iniciar sesión para entrar a mi espacio financiero.
- Como usuario, quiero actualizar mi perfil y contraseña para mantener mi cuenta.
- Como usuario, quiero que mis datos estén restringidos a mi identidad.

## Requisitos funcionales y aceptación
**RF-M6-01 · Registro, acceso y cierre.**
- CUANDO una persona se registra, EL SISTEMA DEBERÁ solicitar nombre visible, correo y contraseña de 12 a 1024 caracteres.
- CUANDO el registro o acceso se confirma, EL SISTEMA DEBERÁ iniciar la sesión y permitir consultar la información privada.
- CUANDO se envía el correo de acceso o registro, EL SISTEMA DEBERÁ quitar espacios extremos y normalizarlo a minúsculas.
- CUANDO el usuario cierra sesión, EL SISTEMA DEBERÁ retirar inmediatamente los datos visibles y solicitar el cierre remoto.
- SI no se confirma el cierre remoto, ENTONCES EL SISTEMA DEBERÁ informar que el cierre solo se confirmó en el dispositivo.

**RF-M6-02 · Gestión del perfil.**
- CUANDO se consulta el perfil, EL SISTEMA DEBERÁ mostrar nombre visible, correo, saldo inicial, fecha inicial y moneda BOB.
- CUANDO se guarda el perfil, EL SISTEMA DEBERÁ permitir actualizar los cuatro primeros datos sin permitir cambiar moneda ni identidad.
- SI el servicio informa correo ocupado o fecha incompatible con el historial, ENTONCES EL SISTEMA DEBERÁ mostrar el conflicto sin informar éxito.
- CUANDO se confirma un nuevo correo, EL SISTEMA DEBERÁ actualizar el correo visible de la sesión.

**RF-M6-03 · Protección de contraseñas.**
- CUANDO se cambia la contraseña, EL SISTEMA DEBERÁ solicitar la contraseña actual, la nueva de 12 a 1024 caracteres y su confirmación coincidente.
- CUANDO el cambio se confirma, EL SISTEMA DEBERÁ terminar la sesión local y solicitar un nuevo acceso.
- MIENTRAS no se solicita mostrar la contraseña de acceso, EL SISTEMA DEBERÁ ocultarla visualmente.
- La conservación segura de contraseñas y la revocación de todas las sesiones son requisitos del servicio; permanecen pendientes de acreditación externa.

**RF-M6-04 · Restricción por usuario.**
- MIENTRAS no existe sesión, EL SISTEMA DEBERÁ mostrar el acceso en lugar de los registros financieros.
- CUANDO vence la sesión o una consulta financiera reconoce su vencimiento, EL SISTEMA DEBERÁ retirar los datos privados y solicitar acceso.
- CUANDO se recarga la aplicación, EL SISTEMA DEBERÁ solicitar acceso nuevamente sin recuperar una sesión persistida en el navegador.
- La denegación de lecturas y escrituras de datos ajenos deberá verificarse externamente con dos cuentas; la interfaz por sí sola no acredita ese aislamiento.

## Requisitos no funcionales
- Sesión conservada solo en memoria; mensajes en español.
- Credenciales fuera de documentación y configuración pública.
- Operaciones sin confirmación no se presentan como exitosas.
- Formularios etiquetados y estados de carga comunicados.

## Casos límite
Correo duplicado, cuenta antigua sin nombre, contraseña actual incorrecta, confirmación diferente y sesión vencida.
Fallo al cerrar remotamente, fecha inicial incompatible con historial y saldo inicial negativo admitido por el contrato.

## Fuera de alcance
Recuperación por correo, verificación de correo, autenticación multifactor, roles de administración y eliminación de cuenta.

## Criterios de finalización
Los recorridos de interfaz requieren evidencia de registro, edición y cambio de contraseña.
RF-M6-03 y RF-M6-04 no estarán globalmente cerrados sin evidencia externa de protección y aislamiento por propietario.

## Recomendaciones y dudas
RECOMENDACIÓN: conservar el mecanismo de sesión actual y entregar las verificaciones externas como dependencia separada, sin afirmar cumplimiento de seguridad a partir de datos controlados.
