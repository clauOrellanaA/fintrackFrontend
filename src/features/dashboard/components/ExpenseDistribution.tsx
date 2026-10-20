import { ChartPie } from 'lucide-react';
import type { CSSProperties } from 'react';
import { formatBobMoney } from '../../../shared/formatters/money';
import type { DashboardSections } from '../api/contract';
import { monthLabel } from '../lib/period';

type Distribution = DashboardSections['expenseDistribution'];
type DistributionStyle = CSSProperties & { '--distribution-width': string; '--distribution-color': string };
const chartColors = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)', 'var(--color-chart-6)'] as const;

function percentageLabel(percentage: string): string {
  return `${percentage.replace('.', ',')} %`;
}

export function ExpenseDistribution({ distribution, month }: { distribution: Distribution; month: string }) {
  if (distribution.status === 'notAvailable') {
    return <section className="expense-distribution panel-slot" aria-labelledby="expense-distribution-title">
      <div className="panel-slot-heading"><div><h2 id="expense-distribution-title">Distribución de gastos</h2><p>Este detalle aún no está disponible para la consulta.</p></div><span className="tile-icon"><ChartPie size={19} aria-hidden="true" /></span></div>
    </section>;
  }

  if (distribution.data.length === 0) {
    return <section className="expense-distribution panel-slot" aria-labelledby="expense-distribution-title">
      <div className="panel-slot-heading"><div><h2 id="expense-distribution-title">Distribución de gastos</h2><p>{monthLabel(month)}</p></div><span className="tile-icon"><ChartPie size={19} aria-hidden="true" /></span></div>
      <div className="expense-distribution__empty"><ChartPie size={38} aria-hidden="true" /><strong>Sin gastos en este período</strong><p>No registraste gastos en {monthLabel(month)}.</p></div>
    </section>;
  }

  return <section className="expense-distribution panel-slot" aria-labelledby="expense-distribution-title">
    <div className="panel-slot-heading"><div><h2 id="expense-distribution-title">Distribución de gastos</h2><p>{monthLabel(month)} · montos y porcentajes del período</p></div><span className="tile-icon"><ChartPie size={19} aria-hidden="true" /></span></div>
    <ol className="expense-distribution__list" aria-label={`Detalle textual de gastos de ${monthLabel(month)}`}>
      {distribution.data.map((item, index) => {
        const style: DistributionStyle = { '--distribution-width': `${item.percentage}%`, '--distribution-color': chartColors[index % chartColors.length] };
        return <li className="expense-distribution__item" key={item.categoryId ?? 'uncategorized'}>
          <div className="expense-distribution__row"><span className="expense-distribution__name"><i style={{ background: style['--distribution-color'] }} aria-hidden="true" />{item.categoryName}</span><span className="expense-distribution__amount financial-amount">{formatBobMoney(item.amount)}</span></div>
          <div className="expense-distribution__bar" aria-hidden="true"><span style={style} /></div>
          <span className="expense-distribution__percentage">{percentageLabel(item.percentage)} del gasto mensual</span>
        </li>;
      })}
    </ol>
  </section>;
}
