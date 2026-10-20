# Hooks de Codex — frontend

Configuración del repositorio en `.codex/hooks.json`, compartida por dashboard (módulo 1), movimientos (módulo 2) y presupuestos (módulo 3). En Windows se invocan mediante `py -3`; en otros sistemas, `python3`.

## Automatizaciones

- `proteger_archivos.py`, en `PreToolUse` de `apply_patch`, bloquea cambios a pruebas (`tests/`, `__tests__/`, `*.test.*`, `*.spec.*`) y archivos `.env*`, excepto `.env.example`.
- `prohibir_tokens_persistentes.py`, también en `PreToolUse` de `apply_patch`, bloquea escrituras de valores asociados a tokens, credenciales o sesiones en `localStorage`, `sessionStorage` o `document.cookie` dentro de `src/`. No afecta preferencias no relacionadas con autenticación, comentarios ni lecturas.
- `bloquear_comandos.py`, en `PreToolUse`, rechaza operaciones destructivas y push forzado. Antes de un push exige una rama `feature/`, `fix/` o `chore/` y ejecuta las pruebas de dashboard, transacciones y presupuestos; los pushes directos a `main`, `dev` y `qa` se bloquean.
- `ejecutar_tests.py`, en `PostToolUse` de `apply_patch`, ejecuta Vitest para el área tocada entre dashboard, transacciones y presupuestos. Prefiere Node 24 local; si no está disponible, usa Docker `node:24-alpine`, copia el código a un directorio temporal excluyendo `.env*`, `node_modules`, `dist` y `.git`, instala dependencias y ejecuta los tests.
- `auditoria.py`, en `PostToolUse` y `SubagentStop`, guarda fecha, evento, herramienta y, para parches, solo los nombres de archivos. No registra comandos ni contenido del parche.

El registro local `.codex/auditoria.log` no se versiona (`*.log`). Los hooks no sustituyen CI; la action existente ejecuta lint, typecheck, suite y build.

## Validación

2026-10-19: se reemplazaron los scripts JavaScript previos. El hook Python bloqueó `.env.local` y la edición de `useCategories.test.ts`, permitió `.env.example`, ejecutó Vitest de dashboard y transacciones, y comprobó el auditor y los gates de push.

2026-10-19: se añadió la protección contra persistencia de credenciales de autenticación. Ejecuta `py -3 .codex/hooks/test_prohibir_tokens_persistentes.py` para validar escrituras bloqueadas, preferencias permitidas, comentarios y archivos fuera de `src/`. También se amplió la selección de pruebas automática y el gate de pre-push para incluir presupuestos. Los tests unitarios y la invocación directa con un evento `PreToolUse` pasaron. La prueba real mediante Codex CLI no pudo ejecutar la herramienta de terminal en este entorno: Windows devolvió `CreateProcessAsUserW failed: 5 (Access is denied.)`; por ello, la activación end-to-end en el loop del agente queda sin confirmar.
