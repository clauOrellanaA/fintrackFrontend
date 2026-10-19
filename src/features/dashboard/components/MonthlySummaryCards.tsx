import { ArrowDownLeft, ArrowUpRight, CircleDashed } from 'lucide-react';
import { formatBobMoney } from '../../../shared/formatters/money';
import type { DashboardSections } from '../api/contract';
import { monthLabel } from '../lib/period';

type Summary = DashboardSections['monthlySummary'];

function SummaryMetric({ title, amount, month, kind }: { title: 'Ingresos' | 'Gastos'; amount: string; month: string; kind: 'income' | 'expense' }) {
  const Icon = kind === 'income' ? ArrowDownLeft : ArrowUpRight;
  const noMovement = amount === '0.00';
  return <article className={`summary-card summary-card--${kind}`}>
    <div className="metric-slot-heading"><span className="tile-icon"><Icon size={19} aria-hidden="true" /></span><span className="summary-card__type">{kind === 'income' ? 'Entrada' : 'Salida'}</span></div>
    <h2>{title} del mes</h2>
    <p className="summary-card__amount financial-amount">{formatBobMoney(amount)}</p>
    <p className="summary-card__period"><CircleDashed size={14} aria-hidden="true" />{noMovement ? `Sin movimientos en ${monthLabel(month)}` : monthLabel(month)}</p>
  </article>;
}

export function MonthlySummaryCards({ summary, month }: { summary: Summary; month: string }) {
  if (summary.status === 'notAvailable') {
    return <article className="summary-card summary-card--unavailable">
      <div className="metric-slot-heading"><span className="tile-icon"><CircleDashed size={19} aria-hidden="true" /></span><span className="coming-soon">No disponible</span></div>
      <h2>Resumen del mes</h2>
      <p>Los ingresos y gastos aún no están disponibles para esta consulta.</p>
    </article>;
  }

  return <>
    <SummaryMetric title="Ingresos" amount={summary.data.income} month={month} kind="income" />
    <SummaryMetric title="Gastos" amount={summary.data.expense} month={month} kind="expense" />
  </>;
}
