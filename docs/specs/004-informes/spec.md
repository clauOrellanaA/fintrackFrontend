# M4 · Estadísticas e informes
Estado: especificación retrospectiva del frontend; validación integrada pendiente.
Referencia de comportamiento: base 6f4679e, 29 de octubre de 2026.

## Contexto y objetivo
Comparar ingresos y gastos y observar la evolución del saldo en un período elegido.
Los resultados corresponden a los valores informados para ese intervalo y a un corte explícito.

## Usuarios
Persona autenticada que analiza sus finanzas durante uno o varios meses.

## Historias de usuario
### HU-M4-01

Como usuario, quiero comparar ingresos y gastos para comprender el resultado del período.

Requisitos: `RF-M4-01`. Seguimiento: [#34](https://github.com/clauOrellanaA/fintrackFrontend/issues/34).
### HU-M4-02

Como usuario, quiero ver gastos por categoría y evolución mensual para reconocer patrones.

Requisitos: `RF-M4-02`, `RF-M4-03`. Seguimiento: [#34](https://github.com/clauOrellanaA/fintrackFrontend/issues/34).
### HU-M4-03

Como usuario, quiero elegir fechas para acotar el análisis.

Requisitos: `RF-M4-04`. Seguimiento: [#34](https://github.com/clauOrellanaA/fintrackFrontend/issues/34).

## Requisitos funcionales y aceptación
**RF-M4-01 · Comparación de ingresos y gastos.**
- CUANDO existe un informe válido, EL SISTEMA DEBERÁ mostrar ingresos, gastos y neto por separado en BOB.
- CUANDO esos valores son cero o el neto es negativo, EL SISTEMA DEBERÁ conservar los valores informados.
- CUANDO presenta los resultados, EL SISTEMA DEBERÁ mostrar su fecha de corte.

**RF-M4-02 · Gastos por categoría.**
- CUANDO existen gastos distribuidos por categoría, EL SISTEMA DEBERÁ mostrar categoría, importe y porcentaje con representación gráfica y detalle textual.
- CUANDO no existen categorías con gastos en el informe, EL SISTEMA DEBERÁ comunicar ese vacío sin inventar valores.

**RF-M4-03 · Evolución mensual del saldo.**
- CUANDO existe una serie mensual, EL SISTEMA DEBERÁ mostrar su evolución gráfica y una tabla con mes, saldo exacto y corte.
- CUANDO la serie está vacía, EL SISTEMA DEBERÁ indicar que no hay datos de evolución.
- CUANDO un saldo mensual es negativo, EL SISTEMA DEBERÁ conservarlo en la alternativa textual.

**RF-M4-04 · Intervalo de fechas.**
- CUANDO se abre la consulta, EL SISTEMA DEBERÁ proponer desde el primer día del mes de once meses atrás hasta el día actual de Bolivia.
- CUANDO el usuario solicita otro período válido, EL SISTEMA DEBERÁ consultar y presentar ese mismo período.
- SI las fechas no existen, están invertidas o abarcan más de 24 meses calendario inclusivos, ENTONCES EL SISTEMA DEBERÁ impedir la consulta y explicar el error.
- SI la respuesta corresponde a otras fechas, ENTONCES EL SISTEMA DEBERÁ mostrar un fallo en lugar de presentar un informe ajeno al intervalo solicitado.
- SI una respuesta anterior llega tarde, ENTONCES EL SISTEMA DEBERÁ impedir que sustituya el informe vigente.

## Requisitos no funcionales
- BOB con dos decimales y calendario de America/La_Paz.
- Gráficos con alternativa textual, controles etiquetados y mensajes en español.
- Carga, fallo y vacío diferenciados; posibilidad de reintento tras un fallo.
- Los resultados requieren sesión; la información no se conserva como informe visible tras cambiarla.

## Casos límite
Rango de un día, año bisiesto, cambio de año, exactamente 24 meses y 25 meses calendario.
Sin gastos, serie vacía, saldo negativo, importes grandes, respuesta inválida y sesión vencida.

## Fuera de alcance
Exportaciones, informes programados, previsiones y comparación automática con un período anterior.

## Criterios de finalización
Cada RF necesita evidencia de controles, resultados y estados; la exactitud de agregaciones requiere comprobación integrada.
Los resultados controlados de interfaz no acreditan persistencia ni cálculos externos.

## Recomendaciones y dudas
RECOMENDACIÓN: mantener el límite actual de 24 meses calendario y comprobar el informe contra datos sintéticos reales antes del cierre integrado.
