# Equipo de frontend de FinanTrack

Esta configuración coordina exclusivamente fintrackFrontend mediante `$fintrack-collaboration`. Describe la funcionalidad y el resultado esperado.

| Etapa | Rol local | Entrega |
| --- | --- | --- |
| Planificación | frontend-planner | Alcance, contrato y aceptación |
| Código | frontend-coder | Implementación local |
| Revisión | frontend-reviewer | Hallazgos independientes |
| Escritura de tests | frontend-test-writer | Tests y fixtures |
| Documentación | frontend-documenter | Documentación comprobada |
| Pruebas | frontend-qa | Ejecución y evidencia |

Este repositorio no contiene especialista de base de datos. Accede a los datos mediante la API; comunica al coordinador necesidades de persistencia como dependencias externas.


## Uso

Abre una nueva sesión de Codex en este repositorio para cargar sus roles locales.

> Usa $fintrack-collaboration. Implementa [descripción de la funcionalidad].

Los subagentes no leen ni modifican el repositorio hermano ni ejecutan comandos en él. Los contratos necesarios se mantienen en el repositorio propio o se proporcionan mediante el coordinador. Si hace falta trabajo en la otra capa, se entrega una dependencia para una sesión separada de ese repositorio. La separación se establece mediante roles e instrucciones; no configura un aislamiento técnico del sistema de archivos.

Hay hasta tres subagentes simultáneos, trabajando por turnos y sin descendientes. Test-writer escribe tests; QA verifica de forma independiente. Revisión y QA no editan código. Los agentes heredan modelo y permisos de la sesión.

Skill: ../.agents/skills/fintrack-collaboration/SKILL.md. Las copias de backend y frontend tienen alcance distinto y no deben sobrescribirse una con otra.

Aplica C:/fintrack/docs/git-por-feature.md: worktree por feature, responsable único de Git y publicación limitada a la rama autorizada. Solo planificación/revisión no publica; merge y despliegue requieren autorización aparte. Solo el coordinador actualiza C:/fintrack/docs. No versionar secretos ni .env. Cargar esta configuración no inicia features ni publica cambios.

## Hooks de Codex

Los hooks locales de este repositorio estan definidos en [hooks.json](./hooks.json). Protegen secretos y pruebas, ejecutan Vitest para dashboard/transacciones, verifican los tests antes de push de ramas feature y registran actividad sin comandos ni contenido de parches. La documentacion especifica esta en [codex-hooks.md](../docs/codex-hooks.md).
