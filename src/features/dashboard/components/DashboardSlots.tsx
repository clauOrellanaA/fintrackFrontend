import type { DashboardSections } from '../api/contract';
import { BalanceCard } from './BalanceCard';
import { BudgetIndicators } from './BudgetIndicators';
import { ExpenseDistribution } from './ExpenseDistribution';
import { MonthlySummaryCards } from './MonthlySummaryCards';
import { SavingsGoalsCard } from './SavingsGoalsCard';
export function DashboardSlots({ sections, month }: { sections: DashboardSections; month: string }) {
  const unavailable = Object.values(sections).some(section => section.status === 'notAvailable');
  return <>
    {unavailable && <p className="notice notice--warning" role="status">Algunas áreas de tu panel todavía no están disponibles. No las mostraremos como valores en cero.</p>}
    <div className="metric-grid"><BalanceCard balance={sections.balance} /><MonthlySummaryCards summary={sections.monthlySummary} month={month} /><SavingsGoalsCard goals={sections.savingsGoals} /></div>
    <div className="dashboard-section-grid">
      <ExpenseDistribution distribution={sections.expenseDistribution} month={month} />
      <BudgetIndicators budgets={sections.budgets} month={month} />
    </div>
  </>;
}
