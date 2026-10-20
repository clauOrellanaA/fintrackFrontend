# Módulo 3 — Gestión de presupuestos (frontend)

La ruta `/budgets` permite consultar el mes elegido, crear un presupuesto para una categoría propia, editar su límite y eliminarlo con confirmación. La lista muestra gasto, límite, saldo disponible/exceso, progreso y el estado calculado por el backend. El estado `warning` alerta desde 80 % y `exceeded` sobre el límite; el frontend no recalcula el estado.

Se consume la sesión en memoria y la API `/api/v1/budgets`; el mes usa el helper existente para `America/La_Paz` y los importes se conservan como cadenas exactas BOB. Se representan carga, error con reintento, mes vacío, falta de categorías, conflicto y confirmación de eliminación. El dashboard existente sigue mostrando los mismos indicadores.

Validación ejecutada: pendiente de completar.
