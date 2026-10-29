# Arquitectura por features

| Feature | Responsabilidad |
| --- | --- |
| dashboard | Saldo, resumen mensual, graficos e indicadores |
| transactions | Ingresos y gastos, categorias, fechas, busqueda y filtros |
| budgets | Limites mensuales por categoria y alertas al 80 % y al superar 100 % |
| reports | Comparaciones, distribucion por categoria y evolucion mensual |
| savings-goals | Objetivos, montos, fechas y aportes de ahorro |
| notifications | Planificada: bandeja de avisos; hoy existen solo indicadores en presupuestos y metas |
| auth | Registro, inicio de sesion y autenticacion |
| users | Perfil y propiedad de los datos |

Frontend: app contiene composicion, rutas y proveedores; features contiene paginas, componentes, hooks, tipos y acceso a API de cada dominio; shared contiene piezas reutilizables sin logica propia de una feature.

La API externa concentra persistencia, calculos financieros y autorizacion. Su arquitectura y ORM quedan fuera del alcance de este repositorio; esta documentacion frontend no acredita su implementacion.

Las features no deben depender de detalles internos de otras features. Las operaciones financieras, validaciones y autorizacion pertenecen al backend. Toda consulta financiera debe restringirse al usuario autenticado. Las contrasenas se almacenaran con hash seguro en el backend.

Los contratos locales fijan moneda BOB, importes JSON como cadenas decimales de dos posiciones y zona America/La_Paz. El cliente presenta los agregados y estados recibidos sin recalcular las reglas financieras. La persistencia exacta y el redondeo del servicio requieren evidencia externa.

El frontend implementa acceso mediante sesion Bearer en memoria y consume el contrato del panel. La autorizacion por usuario y las reglas financieras pertenecen a la API externa; el cierre de integracion real sigue pendiente. Consultar docs/integration.md y docs/fe-06-delivery.md.

Linea base SDD: ver [indice documental](README.md), [constitucion](constitution.md) e [inventario de capacidades](sdd/inventory.md). La gestion de perfil implementada reside en src/features/account; users es un nombre de dominio previsto en la estructura inicial.
