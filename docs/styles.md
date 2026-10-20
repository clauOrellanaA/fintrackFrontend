# Tema visual de FinanTrack

La referencia visual se traduce en un fondo lavanda, superficies blancas, sidebar clara y acentos violetas. Los textos y estados utilizan tonos mas oscuros para conservar legibilidad.

La fuente inicial es Segoe UI en Windows, con alternativas del sistema. No se ha identificado ni instalado la fuente de la imagen. Para cambiar la tipografia de toda la aplicacion, actualizar las familias en typography.css; si se elige una fuente externa, incorporar sus archivos y licencia antes de referenciarla.

## Archivos

- src/app/styles/colors.css: paleta base, colores semanticos, estados financieros y graficos.
- src/app/styles/typography.css: familias, pesos, tamanos y alturas de linea.
- src/app/styles/global.css: estilos base, foco visible y cifras tabulares.
- src/app/styles/index.css: entrada unica del tema.

React/Vite esta inicializado. src/main.tsx importa una sola vez la entrada del tema:

```tsx
import './app/styles/index.css';
```

## Uso en componentes

```css
.balance-card {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  font-family: var(--font-family-body);
}

.balance-card__amount {
  font-size: var(--font-size-metric);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  font-variant-numeric: tabular-nums;
}

.balance-card__income {
  color: var(--color-income);
  background-color: var(--color-success-background);
}
```

Usar tokens semanticos en las features: --color-primary en lugar de --palette-violet-600. Los valores literales de color se definen solo en colors.css; familias, pesos y tamanos tipograficos se definen en typography.css. Esta convencion aun no tiene una regla de lint automatica.

Para bibliotecas de graficos que necesiten un color resuelto en JavaScript, leer el token en el navegador:

```ts
const incomeColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--color-chart-income')
  .trim();
```

Si el tema cambia dinamicamente, volver a resolver los colores del grafico. Acompanar ingresos, gastos y alertas con etiquetas o iconos: el color por si solo no expresa su significado.

FE-00 aplica este tema claro al contenedor responsive del panel: fondo lavanda, superficies blancas, sidebar suave, bordes redondeados e iconos Lucide. Conserva las familias del sistema y centraliza colores/tipografia en sus tokens. No se agrega Tailwind ni modo oscuro. Las tarjetas financieras funcionales corresponden a FE-01–FE-05; FE-00 muestra espacios pendientes sin cifras simuladas.
