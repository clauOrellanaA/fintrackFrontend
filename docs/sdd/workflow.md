# SDD sencillo para un proyecto existente

Este proceso documenta FinanTrack tal como está y dirige únicamente el trabajo pendiente. No aplica el stack Python ni los comandos de habits-cli: el ejemplo recibido aporta el orden constitución → spec → revisión → plan → tareas → comprobación.

## 1. Reconstruir sin cuestionario

Leer primero constitución, rutas, pantallas, validaciones, contratos y tests del módulo en la base Git registrada. Usar la implementación observable como primera evidencia; usar los documentos antiguos como antecedentes. No volver a preguntar reglas ya resueltas.

Clasificar cada afirmación como **OBSERVADO**, **RECOMENDACIÓN** o **DEPENDENCIA EXTERNA**. Ante una decisión ausente, adoptar y registrar la recomendación más sencilla compatible con el contrato. No presentarla como comportamiento existente. Si depende del servidor, preparar su contrato y dejar la ejecución dependiente hasta recibirlo. No bloquear la redacción con preguntas de negocio.

## 2. Especificar el qué y el porqué

Mantener `docs/specs/NNN-tema/spec.md`: contexto, usuarios, historias, RF y aceptación EARS en español, RNF, límites, fuera de alcance, finalización y decisiones recomendadas. Una spec retrospectiva puede revelar un defecto; documentar lo observado y la mejora separadamente.

EARS: «CUANDO ocurre un evento, el sistema DEBE producir un resultado»; «MIENTRAS existe un estado…»; «SI ocurre una condición de error…». Evitar aceptación subjetiva como “rápido”, “correcto” o “seguro” sin comprobación.

Los RF existentes mantienen IDs RF-M1-01 a RF-M6-04. Notificaciones añade RF-N-01 a RF-N-05 y completa RF-M5-04. No renumerar requisitos al agregar pruebas.

## 3. Revisar y planificar

Revisar ambigüedades, contradicciones, límites y conflictos con constitución. Registrar la evidencia y resolver recomendaciones rutinarias sin cuestionario. Los planes detallan módulos existentes, contrato consumido, estados, decisiones con alternativa y estrategia de tests; no rediseñar lo que funciona.

Un contrato propuesto debe indicar que todavía no existe y separar dependencia externa de entrega frontend. Nunca acreditar hash de contraseñas, autorización del servidor o persistencia por inspección del cliente.

## 4. Dividir y ejecutar solo lo encargado

Cada `tasks.md` contiene únicamente pendientes: checkbox, ID, duración de 20–30 minutos, dependencia, RF y «Hecho cuando:» comprobable. No marcar tareas retrospectivas como ejecutadas. Partir una tarea que supere el límite.

Para implementar después: preparar un worktree por feature y un responsable Git siguiendo [el protocolo](../../CONTRIBUTING.md) y C:/fintrack/docs/git-por-feature.md. Escribir el test pertinente, implementar solo la tarea encargada, ejecutar los checks aplicables y registrar resultado. La planificación actual no inicia estas tareas ni autoriza publicación.

## 5. Comprobar y mantener

Por RF registrar test concreto, alcance (estático, unitario/controlado o API real), comando, resultado, fecha y SHA. “Existe un test” no equivale a “pasó”. Datos sintéticos no prueban persistencia ni aislamiento del servicio. Actualizar inventario, spec, plan y tareas únicamente en el alcance cambiado.

Una feature termina cuando sus aceptaciones tienen evidencia, los errores y estados vacíos están probados y no queda una dependencia obligatoria abierta. Sin API real disponible, cerrar solo la parte local que se haya comprobado y conservar explícito el pendiente externo.

Usar [las plantillas](templates.md) y [la matriz de verificación](verification.md). No añadir documentos por ceremonia: un conjunto spec/plan/tasks por módulo o feature basta.
