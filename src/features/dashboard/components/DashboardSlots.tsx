import { Flag, type LucideIcon } from 'lucide-react';
import type { DashboardSections } from '../api/contract';
import { BalanceCard } from './BalanceCard';
import { BudgetIndicators } from './BudgetIndicators';
import { ExpenseDistribution } from './ExpenseDistribution';
import { MonthlySummaryCards } from './MonthlySummaryCards';

function MetricSlot({ title, icon: Icon, description }: { title: string; icon: LucideIcon; description: string }) {
  return <article className="metric-slot"><div className="metric-slot-heading"><span className="tile-icon"><Icon size={19} aria-hidden="true" /></span><span className="coming-soon">Próximamente</span></div><h2>{title}</h2><p>{description}</p></article>;
}
export function DashboardSlots({ sections, month }: { sections: DashboardSections; month: string }) {
  const unavailable = Object.values(sections).some(section => section.status === 'notAvailable');
  return <>
    {unavailable && <p className="notice notice--warning" role="status">Algunas áreas de tu panel todavía no están disponibles. No las mostraremos como valores en cero.</p>}
    <div className="metric-grid"><BalanceCard balance={sections.balance} /><MonthlySummaryCards summary={sections.monthlySummary} month={month} /><MetricSlot title="Metas de ahorro" icon={Flag} description="Un lugar para cada objetivo que te inspira." /></div>
    <div className="dashboard-section-grid">
      <ExpenseDistribution distribution={sections.expenseDistribution} month={month} />
      <BudgetIndicators budgets={sections.budgets} month={month} />
    </div>
  </>;
}
