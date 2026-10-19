import { CircleDashed, Target } from 'lucide-react';
import type { CSSProperties } from 'react';
import { formatBobMoney } from '../../../shared/formatters/money';
import type { DashboardSections } from '../api/contract';
import { monthLabel } from '../lib/period';

type Budgets = DashboardSections['budgets'];
type BudgetState = 'normal' | 'warning' | 'exceeded';
type ProgressStyle = CSSProperties & { '--budget-progress': string };

const stateLabels: Record<BudgetState, string> = { normal: 'En rango', warning: 'Atención', exceeded: 'Excedido' };

function progressLabel(progress: string): string {
  return `${progress.replace('.', ',')} %`;
}

export function BudgetIndicators({ budgets, month }: { budgets: Budgets; month: string }) {
  if (budgets.status === 'notAvailable') {
    return <section className="budget-indicators panel-slot" aria-labelledby="budget-indicators-title">
      <div className="panel-slot-heading"><div><h2 id="budget-indicators-title">Presupuestos</h2><p>Este detalle aún no está disponible para la consulta.</p></div><span className="tile-icon"><Target size={19} aria-hidden="true" /></span></div>
    </section>;
  }

  if (budgets.data.length === 0) {
    return <section className="budget-indicators panel-slot" aria-labelledby="budget-indicators-title">
      <div className="panel-slot-heading"><div><h2 id="budget-indicators-title">Presupuestos</h2><p>{monthLabel(month)}</p></div><span className="tile-icon"><Target size={19} aria-hidden="true" /></span></div>
      <div className="budget-indicators__empty"><Target size={38} aria-hidden="true" /><strong>Sin presupuestos para este período</strong><p>No hay presupuestos configurados en {monthLabel(month)}.</p></div>
    </section>;
  }

  return <section className="budget-indicators panel-slot" aria-labelledby="budget-indicators-title">
    <div className="panel-slot-heading"><div><h2 id="budget-indicators-title">Presupuestos</h2><p>{monthLabel(month)} · consumo reportado por el panel</p></div><span className="tile-icon"><Target size={19} aria-hidden="true" /></span></div>
    <ul className="budget-indicators__list" aria-label={`Presupuestos de ${monthLabel(month)}`}>
      {budgets.data.map(budget => {
        const style: ProgressStyle = { '--budget-progress': `${budget.progress}%` };
        return <li className={`budget-indicators__item budget-indicators__item--${budget.state}`} key={budget.id}>
          <div className="budget-indicators__row"><h3>{budget.categoryName}</h3><span className="budget-indicators__state">{stateLabels[budget.state]}</span></div>
          <div className="budget-indicators__amounts"><span>Gastado <strong className="financial-amount">{formatBobMoney(budget.spent)}</strong></span><span>Límite <strong className="financial-amount">{formatBobMoney(budget.limit)}</strong></span></div>
          <div className="budget-indicators__bar" role="img" aria-label={`Progreso de ${budget.categoryName}: ${stateLabels[budget.state]}, ${progressLabel(budget.progress)}`}><span style={style} /></div>
          <div className="budget-indicators__footer"><span><CircleDashed size={13} aria-hidden="true" />Restante <strong className="financial-amount">{formatBobMoney(budget.remaining)}</strong></span><span>{progressLabel(budget.progress)}</span></div>
        </li>;
      })}
    </ul>
  </section>;
}
