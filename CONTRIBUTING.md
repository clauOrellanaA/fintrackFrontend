# Flujo de trabajo Git

Los dos repositorios usan tres ramas permanentes:

- dev: integra el desarrollo diario.
- qa: recibe los cambios de dev para validacion del equipo.
- main: contiene las versiones aprobadas.

Crear ramas feature/<nombre>, fix/<nombre> o chore/<nombre> desde dev y abrir pull requests hacia dev. Promover cambios mediante pull requests de dev hacia qa y de qa hacia main. Mantener commits pequenos con prefijos feat:, fix:, docs: o chore:.

Cada repositorio ejecuta su propia GitHub Action en pushes a main, dev y qa, y en pull requests cuyo destino sea cualquiera de esas tres ramas. Tambien admite ejecucion manual mediante workflow_dispatch. Los mismos controles se aplican a las tres ramas; no hay despliegues automaticos ni promociones automaticas.

La CI verifica estructura, archivos obligatorios, ausencia de archivos .env rastreados y formato del diff. El backend tambien valida Docker Compose. Ambos repositorios ejecutan npm ci, lint, chequeo de tipos, npm test y build con Node 24.

Frontend ejecuta Vitest en el job application y Playwright en el job e2e. Este ultimo instala Chromium y sus dependencias de sistema, prueba las vistas desktop y mobile y conserva test-results/ durante siete dias si falla. Los E2E usan respuestas de API controladas: no requieren backend ni acreditan integracion con PostgreSQL. Para reproducirlos: npm ci, npx playwright install chromium y npm run test:e2e.

El frontend ya incluye pruebas de comportamiento de negocio. Para validación opt-in contra una API aislada con dos cuentas sintéticas, consultar docs/integration.md y ejecutar npm run test:e2e:real con las variables del runner. Esa suite no forma parte de la CI ordinaria y requiere infraestructura disponible; los E2E controlados no la sustituyen.

En GitHub, crear main, dev y qa y configurar proteccion para las tres ramas, revision de pull requests y los checks structure, application y e2e como obligatorios en frontend; structure y application en backend. Estas configuraciones requieren un remoto y permisos de administracion; los workflows no crean ramas ni activan protecciones.

Para cambios coordinados en la API, enlazar los pull requests de ambos repositorios y mantener compatibilidad o versionar el contrato.
