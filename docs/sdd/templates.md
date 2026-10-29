# Plantillas mínimas

Copiar solo el conjunto del módulo afectado. Mantener las specs libres de decisiones técnicas y enlazar la evidencia desde el plan.

## spec.md

- Contexto y objetivo: problema y beneficio.
- Usuarios e historias: «Como … quiero … para …».
- RF-X-01 — nombre: estado OBSERVADO / RECOMENDACIÓN / DEPENDENCIA EXTERNA.
  - CUANDO [evento], el sistema DEBE [resultado verificable].
  - SI [error], el sistema DEBE [respuesta observable].
- RNF verificables, casos límite y fuera de alcance.
- Finalización: aceptaciones cubiertas, resultados registrados y dependencias resueltas.
- Decisiones recomendadas: elección, razón y qué falta contrastar; sin cuestionario.

## plan.md

- Base y alcance frontend.
- Tabla RF → componente/hook/contrato existente → test candidato.
- Contrato HTTP vigente o propuesta explícitamente marcada: método, ruta, entrada, salida, errores, autenticación, propiedad, moneda, fechas.
- Decisión, justificación y alternativa descartada.
- Estrategia de tests: unitario/controlado/real por separado.
- Dependencias externas y evidencia pendiente.

## tasks.md

- [ ] T-X-01 (20–30 min) — acción única. RF: RF-X-01. Depende de: ninguna.
  Hecho cuando: resultado comprobable con test/comando/artefacto identificado.

## Registro de evidencia

| RF | Test / aceptación | Comando ejecutado | Resultado | Alcance | Fecha y SHA |
| --- | --- | --- | --- | --- | --- |
| RF-X-01 | Nombre concreto | Pendiente | No ejecutado | Controlado / real / estático | Base de referencia |

No marcar un checkbox por encontrar código existente. No escribir “cumple” sin indicar qué evidencia acredita el alcance.
