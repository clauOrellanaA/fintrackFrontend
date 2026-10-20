import { CalendarDays, CircleDashed, Flag } from 'lucide-react';
import type { CSSProperties } from 'react';
import { formatBobMoney } from '../../../shared/formatters/money';
import type { DashboardSections } from '../api/contract';

type Goals = DashboardSections['savingsGoals'];
type GoalState = 'active' | 'completed' | 'overdue';
type ProgressStyle = CSSProperties & { '--goal-progress': string };

const stateLabels: Record<GoalState, string> = { active: 'En progreso', completed: 'Completada', overdue: 'Vencida' };

function percentageLabel(progress: string): string {
  return `${progress.replace('.', ',')} %`;
}

function targetDateLabel(date: string): string {
  return new Intl.DateTimeFormat('es-BO', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00Z`));
}

export function SavingsGoalsCard({ goals }: { goals: Goals }) {
  if (goals.status === 'notAvailable') {
    return <article className="savings-goals savings-goals--unavailable">
      <div className="metric-slot-heading"><span className="tile-icon"><Flag size={19} aria-hidden="true" /></span><span className="coming-soon">No disponible</span></div>
      <h2>Metas de ahorro</h2>
      <p>Las metas aún no están disponibles para esta consulta.</p>
    </article>;
  }

  if (goals.data.length === 0) {
    return <article className="savings-goals">
      <div className="metric-slot-heading"><span className="tile-icon"><Flag size={19} aria-hidden="true" /></span><span className="savings-goals__count">0 metas</span></div>
      <h2>Metas de ahorro</h2>
      <p className="savings-goals__empty">Aún no tienes metas de ahorro para mostrar.</p>
    </article>;
  }

  return <article className="savings-goals">
    <div className="metric-slot-heading"><span className="tile-icon"><Flag size={19} aria-hidden="true" /></span><span className="savings-goals__count">{goals.data.length} {goals.data.length === 1 ? 'meta' : 'metas'}</span></div>
    <h2>Metas de ahorro</h2>
    <ul className="savings-goals__list" aria-label="Metas de ahorro">
      {goals.data.map(goal => {
        const style: ProgressStyle = { '--goal-progress': `${goal.progress}%` };
        return <li className={`savings-goals__item savings-goals__item--${goal.state}`} key={goal.id}>
          <div className="savings-goals__row"><h3>{goal.name}</h3><span className="savings-goals__state">{stateLabels[goal.state]}</span></div>
          <p className="savings-goals__amounts"><span>Acumulado <strong className="financial-amount">{formatBobMoney(goal.saved)}</strong></span><span>Objetivo <strong className="financial-amount">{formatBobMoney(goal.target)}</strong></span></p>
          <div className="savings-goals__bar" role="img" aria-label={`Progreso de ${goal.name}: ${stateLabels[goal.state]}, ${percentageLabel(goal.progress)}`}><span style={style} /></div>
          <div className="savings-goals__footer"><span><CircleDashed size={13} aria-hidden="true" />Restante <strong className="financial-amount">{formatBobMoney(goal.remaining)}</strong></span><span>{percentageLabel(goal.progress)}</span></div>
          {goal.targetDate && <p className="savings-goals__date"><CalendarDays size={13} aria-hidden="true" />Fecha objetivo: {targetDateLabel(goal.targetDate)}</p>}
        </li>;
      })}
    </ul>
  </article>;
}
