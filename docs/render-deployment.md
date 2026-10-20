# Desplegar frontend en Render

El frontend es una SPA Vite y se publica como Static Site. No necesita un proceso Node en ejecucion. Estos archivos no crean servicios ni despliegan automaticamente hasta importar el Blueprint y autorizar su creacion.

1. Integrar este PR en dev. Incluye los commits de la rama fix/ci-frontend-e2e, por lo que no hace falta integrar esa rama por separado. Confirmar `application`, `structure` y `e2e` en GitHub Actions.
2. Promover mediante PR de dev a qa; para produccion, de qa a main despues de la aceptacion. El backend debe estar desplegado con la API compatible.
3. Despues de integrar estos archivos en main, importar `render.yaml` como Blueprint desde main, o crear New > Static Site con este repositorio y Branch: main. Root Directory vacio; Build Command `npm ci --include=dev && npm run build`; Publish Directory `dist`.
4. Definir NODE_VERSION=24.21.0 y VITE_API_BASE_URL=`https://<backend>.onrender.com/api/v1`. Es una URL publica incorporada durante el build: cualquier cambio requiere reconstruir. No usar el hostname privado PostgreSQL ni agregar secretos VITE_*.
5. Configurar rewrite `/*` hacia `/index.html` (accion Rewrite). El Blueprint ya lo incluye. Esto permite recargar `/dashboard` y `/transactions` con React Router.
6. Configurar Auto-Deploy: After CI Checks Pass; en GitHub hacer obligatorios `application`, `structure` y `e2e` en dev, qa y main. La proteccion de ramas se configura aparte y no se activa con el Blueprint.
7. Actualizar CORS_ORIGIN del backend con el origen HTTPS exacto asignado al frontend, sin ruta ni barra final, y volver a desplegar backend. Frontend llama al backend desde el navegador y necesita su URL publica HTTPS.
8. Validar acceso directo y recarga de `/dashboard`, login con usuario real provisionado, panel vacio o con datos segun corresponda, cambio de mes, vista movil y cierre de sesion. Revisar que no haya errores CORS ni peticiones a localhost.

El Blueprint despliega produccion desde main. Si el servicio ya existe, cambiar tambien su Branch a main en Render o sincronizar el Blueprint. Usar el backend y la base de produccion; no reutilizar la base de QA. Los tests Playwright de escritorio y movil usan respuestas controladas de API: validan navegador, no integracion con el backend real. Ante fallo del job e2e, descargar playwright-test-results desde GitHub Actions.

El primer usuario se provisiona desde backend siguiendo su docs/render-deployment.md. No introducir credenciales iniciales ni de base de datos en este repositorio.

Referencias: [Static Sites](https://render.com/docs/static-sites), [rewrites](https://render.com/docs/redirects-rewrites), [Blueprints](https://render.com/docs/blueprint-spec), [deploys condicionados a CI](https://render.com/docs/deploys).
