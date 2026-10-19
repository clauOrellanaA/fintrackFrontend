import { useState } from 'react';
import { CalendarDays, Check, CircleAlert, Leaf, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { useSession } from '../../shared/session/SessionProvider';
import { connectionMessage } from '../../shared/api/http';
import { SignInPanel } from '../auth/SignInPanel';
import { useDashboard } from './hooks/useDashboard';
import { currentMonth, cutoffLabel, monthLabel } from './lib/period';
import { DashboardSlots } from './components/DashboardSlots';
import type { Dashboard } from './api/contract';
import './dashboard.css';

export function isEmptyDashboard(dashboard: Dashboard): boolean {
  const s = dashboard.sections;
  return s.balance.status === 'ready' && s.balance.data.amount === '0.00' && s.monthlySummary.status === 'ready'
    && s.monthlySummary.data.income === '0.00' && s.monthlySummary.data.expense === '0.00'
    && s.expenseDistribution.status === 'ready' && s.expenseDistribution.data.length === 0
    && s.budgets.status === 'ready' && s.budgets.data.length === 0 && s.savingsGoals.status === 'ready' && s.savingsGoals.data.length === 0;
}
function DashboardContent({ month, setMonth }: { month: string; setMonth(value: string): void }) {
  const result = useDashboard(month);
  const loading = result.status === 'loading' || result.status === 'idle';
  return <>
    <div className="dashboard-toolbar"><label className="month-control" htmlFor="dashboard-month"><CalendarDays size={18} aria-hidden="true" /><span>Período</span><input id="dashboard-month" aria-label="Mes consultado" type="month" value={month} min="1900-01" max="9998-12" onChange={event => { if (/^\d{4}-(0[1-9]|1[0-2])$/.test(event.target.value)) setMonth(event.target.value); }} /></label><div className="toolbar-actions"><span className="currency-label">BOB · Bolivia</span><button className="button button--secondary" type="button" aria-label="Actualizar panel" title="Actualizar panel" onClick={result.retry} disabled={loading}><RefreshCw size={16} className={loading ? 'spinning' : undefined} aria-hidden="true" />Actualizar</button></div></div>
    {loading && <section className="loading-panel" role="status" aria-busy="true"><span className="sr-only">Cargando tu panel para {monthLabel(month)}…</span><div className="metric-grid" aria-hidden="true">{[1, 2, 3, 4].map(item => <div className="skeleton-card" key={item}><span /><span /><span /></div>)}</div><div className="skeleton-section" aria-hidden="true" /></section>}
    {result.status === 'error' && <section className="state-card state-card--error" role="alert"><CircleAlert size={34} aria-hidden="true" /><h2>No pudimos abrir tu panel</h2><p>{connectionMessage(result.error)}</p><button className="button button--primary" type="button" onClick={result.retry}>Volver a intentar</button></section>}
    {result.status === 'success' && <>
      <div className="sync-banner" role="status"><span className="sync-check"><Check size={16} aria-hidden="true" /></span><div><strong>Tu información está conectada</strong><span>{monthLabel(result.data.period.month)} · Corte: {cutoffLabel(result.data.asOf)} (Bolivia)</span></div><ShieldCheck size={20} className="sync-shield" aria-hidden="true" /></div>
      {isEmptyDashboard(result.data) && <section className="empty-dashboard"><Leaf size={29} aria-hidden="true" /><div><h2>Tu historia financiera empieza aquí</h2><p>Todavía no hay datos financieros para mostrar. Tu panel distinguirá cada nuevo paso.</p></div></section>}
      <DashboardSlots sections={result.data.sections} />
    </>}
  </>;
}
export function DashboardPage() {
  const { session } = useSession();
  const [month, setMonth] = useState(currentMonth);
  return <div className="dashboard-page"><div className="page-heading"><div><p className="eyebrow">PANEL PRINCIPAL</p><h1>Un vistazo a tus finanzas.</h1><p className="page-subtitle">Más claridad para hoy. Más tranquilidad para lo que viene.</p></div><span className="heading-accent" aria-hidden="true"><Sparkles size={25} strokeWidth={1.4} /></span></div>
    {session ? <DashboardContent key={session.token} month={month} setMonth={setMonth} /> : <SignInPanel />}
  </div>;
}
