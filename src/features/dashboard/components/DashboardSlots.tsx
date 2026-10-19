import { ChartPie, Flag, Target, type LucideIcon } from 'lucide-react';
import type { DashboardSections } from '../api/contract';
import { BalanceCard } from './BalanceCard';
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
      <section className="panel-slot"><div className="panel-slot-heading"><div><h2>Distribución de gastos</h2><p>Encuentra la perspectiva de tu mes.</p></div><span className="tile-icon"><ChartPie size={19} aria-hidden="true" /></span></div><div className="panel-slot-content"><span className="section-illustration" aria-hidden="true"><ChartPie size={42} strokeWidth={1.2} /></span><strong>Tus categorías tendrán su espacio aquí.</strong><p>La vista de distribución estará disponible próximamente.</p></div></section>
      <section className="panel-slot"><div className="panel-slot-heading"><div><h2>Presupuestos</h2><p>Más intención, menos sorpresas.</p></div><span className="tile-icon"><Target size={19} aria-hidden="true" /></span></div><div className="panel-slot-content"><span className="section-illustration" aria-hidden="true"><Target size={42} strokeWidth={1.2} /></span><strong>Un plan para tu mes.</strong><p>El detalle de tus presupuestos llegará a esta sección.</p></div></section>
    </div>
  </>;
}
