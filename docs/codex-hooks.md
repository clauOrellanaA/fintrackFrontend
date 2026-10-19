# Hooks de Codex — frontend

Configuración del repositorio en `.codex/hooks.json`, compartida por dashboard (módulo 1) y movimientos (módulo 2). En Windows se invocan mediante `py -3`; en otros sistemas, `python3`.

## Automatizaciones

- `proteger_archivos.py`, en `PreToolUse` de `apply_patch`, bloquea cambios a pruebas (`tests/`, `__tests__/`, `*.test.*`, `*.spec.*`) y archivos `.env*`, excepto `.env.example`.
- `bloquear_comandos.py`, en `PreToolUse`, rechaza operaciones destructivas y push forzado. Antes de un push exige una rama `feature/`, `fix/` o `chore/` y ejecuta las pruebas de dashboard y transacciones; los pushes directos a `main`, `dev` y `qa` se bloquean.
- `ejecutar_tests.py`, en `PostToolUse` de `apply_patch`, ejecuta Vitest para el área tocada. Prefiere Node 24 local; si no está disponible, usa Docker `node:24-alpine`, copia el código a un directorio temporal excluyendo `.env*`, `node_modules`, `dist` y `.git`, instala dependencias y ejecuta los tests.
- `auditoria.py`, en `PostToolUse` y `SubagentStop`, guarda fecha, evento, herramienta y, para parches, solo los nombres de archivos. No registra comandos ni contenido del parche.

El registro local `.codex/auditoria.log` no se versiona (`*.log`). Los hooks no sustituyen CI; la action existente ejecuta lint, typecheck, suite y build.

## Validación

2026-10-19: se reemplazaron los scripts JavaScript previos. El hook Python bloqueó `.env.local` y la edición de `useCategories.test.ts`, permitió `.env.example`, y ejecutó Vitest de dashboard y transacciones. La suite completa del frontend pasó con Node 24: 32 pruebas en 11 archivos. Se comprobó también que el auditor no registra el contenido del parche, que el push desde una feature pasa su gate de tests y que el push directo a `main` se bloquea.
