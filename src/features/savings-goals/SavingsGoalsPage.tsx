import { useState, type FormEvent } from 'react';
import { Archive, CalendarDays, CircleAlert, CircleDashed, Flag, Pencil, Plus, RefreshCw, TrendingDown, TrendingUp, X } from 'lucide-react';
import { ApiError } from '../../shared/api/http';
import { formatBobMoney } from '../../shared/formatters/money';
import { useSession } from '../../shared/session/SessionProvider';
import { SignInPanel } from '../auth/SignInPanel';
import type { AddSavingsEntryInput, SaveSavingsGoalInput, SavingsGoal } from './api/contract';
import { useSavingsGoals } from './hooks/useSavingsGoals';
import './savings-goals.css';

const MONEY_PATTERN = /^(?:0|[1-9]\d{0,11})\.\d{2}$/;
const stateLabels = { active: 'En progreso', completed: 'Completada', overdue: 'Vencida' } as const;

function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return 'No pudimos completar la solicitud. Revisa tu conexión e inténtalo de nuevo.';
  if (error.kind === 'unauthenticated') return 'Tu sesión terminó. Inicia sesión de nuevo para continuar.';
  if (error.kind === 'conflict') return 'Ese cambio no es compatible con el historial de la meta.';
  if (error.kind === 'not-found') return 'No encontramos esa meta. Actualiza la lista e inténtalo de nuevo.';
  if (error.kind === 'validation') return 'Revisa los datos ingresados e inténtalo de nuevo.';
  if (error.kind === 'timeout') return 'La conexión está tardando más de lo esperado. Vuelve a intentarlo.';
  if (error.kind === 'configuration') return 'La API no está configurada en este entorno.';
  return 'No pudimos completar la solicitud. Revisa tu conexión e inténtalo de nuevo.';
}

function dateLabel(date: string): string {
  return new Intl.DateTimeFormat('es-BO', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00Z`));
}

function GoalForm({ initial, busy, onCancel, onSave }: { initial: SavingsGoal | null; busy: boolean; onCancel(): void; onSave(input: SaveSavingsGoalInput): Promise<void> }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [target, setTarget] = useState(initial?.target ?? '');
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? '');
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!name.trim() || name.trim().length > 100) { setError('Escribe un nombre de entre 1 y 100 caracteres.'); return; }
    if (!MONEY_PATTERN.test(target) || /^0+\.00$/.test(target)) { setError('Ingresa un objetivo positivo con dos decimales, por ejemplo 5000.00.'); return; }
    if (targetDate && !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) { setError('Selecciona una fecha válida.'); return; }
    try { await onSave({ name: name.trim(), target, targetDate: targetDate || null }); }
    catch (cause) { setError(errorMessage(cause)); }
  }

  return <div className="savings-overlay"><section className="savings-dialog" role="dialog" aria-modal="true" aria-labelledby="goal-dialog-title">
    <div className="savings-dialog__header"><div><span className="eyebrow">{initial ? 'AJUSTAR OBJETIVO' : 'PLANIFICAR AHORRO'}</span><h2 id="goal-dialog-title">{initial ? 'Editar meta' : 'Crear meta'}</h2></div><button className="icon-button" type="button" onClick={onCancel} aria-label="Cerrar formulario"><X size={19} aria-hidden="true" /></button></div>
    <form className="savings-form" onSubmit={event => void submit(event)} noValidate>
      <label htmlFor="goal-name">Nombre de la meta<input autoFocus id="goal-name" maxLength={100} value={name} onChange={event => setName(event.target.value)} placeholder="Fondo de emergencia" required /></label>
      <div className="savings-form__grid"><label htmlFor="goal-target">Objetivo (BOB)<input id="goal-target" inputMode="decimal" maxLength={15} value={target} onChange={event => setTarget(event.target.value)} placeholder="5000.00" required /><span>Usa dos decimales.</span></label><label htmlFor="goal-date">Fecha objetivo<input id="goal-date" type="date" min="1900-01-01" max="9998-12-31" value={targetDate} onChange={event => setTargetDate(event.target.value)} /><span>Opcional.</span></label></div>
      {error && <p className="notice notice--danger" role="alert">{error}</p>}
      <div className="savings-dialog__actions"><button className="button button--secondary" type="button" onClick={onCancel} disabled={busy}>Cancelar</button><button className="button button--primary" type="submit" disabled={busy}>{busy ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear meta'}<Flag size={16} aria-hidden="true" /></button></div>
    </form>
  </section></div>;
}

function EntryForm({ goal, type, busy, onCancel, onSave }: { goal: SavingsGoal; type: AddSavingsEntryInput['type']; busy: boolean; onCancel(): void; onSave(input: AddSavingsEntryInput): Promise<void> }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const contribution = type === 'contribution';
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!MONEY_PATTERN.test(amount) || /^0+\.00$/.test(amount)) { setError('Ingresa un importe positivo con dos decimales.'); return; }
    try { await onSave({ type, amount }); }
    catch (cause) { setError(errorMessage(cause)); }
  }
  return <div className="savings-overlay"><section className="savings-dialog" role="dialog" aria-modal="true" aria-labelledby="entry-dialog-title">
    <div className="savings-dialog__header"><div><span className="eyebrow">{contribution ? 'SUMAR A LA META' : 'RETIRAR DE LA META'}</span><h2 id="entry-dialog-title">{goal.name}</h2></div><button className="icon-button" type="button" onClick={onCancel} aria-label="Cerrar formulario"><X size={19} aria-hidden="true" /></button></div>
    <form className="savings-form" onSubmit={event => void submit(event)} noValidate><label htmlFor="entry-amount">Importe (BOB)<input autoFocus id="entry-amount" inputMode="decimal" maxLength={15} value={amount} onChange={event => setAmount(event.target.value)} placeholder="250.00" required /><span>{contribution ? 'El aporte aumenta el acumulado.' : 'El retiro no puede superar el acumulado.'}</span></label>{error && <p className="notice notice--danger" role="alert">{error}</p>}<div className="savings-dialog__actions"><button className="button button--secondary" type="button" onClick={onCancel} disabled={busy}>Cancelar</button><button className="button button--primary" type="submit" disabled={busy}>{busy ? 'Registrando…' : contribution ? 'Registrar aporte' : 'Registrar retiro'}{contribution ? <TrendingUp size={16} aria-hidden="true" /> : <TrendingDown size={16} aria-hidden="true" />}</button></div></form>
  </section></div>;
}

function GoalCard({ goal, busy, onEdit, onEntry, onArchive }: { goal: SavingsGoal; busy: boolean; onEdit(): void; onEntry(type: AddSavingsEntryInput['type']): void; onArchive(): void }) {
  const progress = Math.min(Number(goal.progress), 100);
  const badge = goal.archived ? 'Archivada' : stateLabels[goal.state];
  return <article className={`savings-card savings-card--${goal.state}${goal.archived ? ' savings-card--archived' : ''}`}>
    <div className="savings-card__top"><span className="savings-card__icon"><Flag size={19} aria-hidden="true" /></span><span className={`savings-card__badge${goal.archived ? ' savings-card__badge--archived' : goal.state === 'overdue' ? ' savings-card__badge--overdue' : ''}`}>{badge}</span></div>
    <div className="savings-card__row"><h2>{goal.name}</h2></div>
    <p className="savings-card__date">{goal.targetDate ? <><CalendarDays size={13} aria-hidden="true" /> Fecha objetivo: {dateLabel(goal.targetDate)}</> : 'Sin fecha objetivo'}</p>
    <div className="savings-card__amounts"><div><span>Acumulado</span><strong className="financial-amount">{formatBobMoney(goal.saved)}</strong></div><div><span>Objetivo</span><strong className="financial-amount">{formatBobMoney(goal.target)}</strong></div></div>
    <div className="savings-progress" role="img" aria-label={`Progreso de ${goal.name}: ${goal.progress.replace('.', ',')} por ciento`}><span style={{ '--savings-progress': `${progress}%` } as React.CSSProperties} /></div>
    <div className="savings-card__footer"><span><CircleDashed size={13} aria-hidden="true" />Restante <strong className="financial-amount">{formatBobMoney(goal.remaining)}</strong></span><strong>{goal.progress.replace('.', ',')} %</strong></div>
    <div className="savings-card__actions"><button className="button button--secondary" type="button" onClick={onEdit} disabled={busy}><Pencil size={14} aria-hidden="true" />Editar</button>{!goal.archived && <><button className="button button--secondary" type="button" onClick={() => onEntry('contribution')} disabled={busy}><TrendingUp size={14} aria-hidden="true" />Aportar</button><button className="button button--secondary" type="button" onClick={() => onEntry('withdrawal')} disabled={busy}><TrendingDown size={14} aria-hidden="true" />Retirar</button></>}<button className="button button--secondary" type="button" onClick={onArchive} disabled={busy}><Archive size={14} aria-hidden="true" />{goal.archived ? 'Restaurar' : 'Archivar'}</button></div>
  </article>;
}

export function SavingsGoalsPage() {
  const { session } = useSession();
  const goals = useSavingsGoals();
  const [goalForm, setGoalForm] = useState<SavingsGoal | null | undefined>(undefined);
  const [entry, setEntry] = useState<{ goal: SavingsGoal; type: AddSavingsEntryInput['type'] } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  if (!session) return <SignInPanel />;

  async function saveGoal(input: SaveSavingsGoalInput) { if (goalForm) await goals.update(goalForm.id, input); else await goals.create(input); setGoalForm(undefined); setActionError(null); }
  async function saveEntry(input: AddSavingsEntryInput) { if (!entry) return; await goals.addEntry(entry.goal.id, input); setEntry(null); setActionError(null); }
  async function toggleArchive(goal: SavingsGoal) { try { await goals.update(goal.id, { archived: !goal.archived }); setActionError(null); } catch (error) { setActionError(errorMessage(error)); } }

  return <section className="savings-page" aria-labelledby="savings-title">
    <header className="page-heading"><div><p className="eyebrow"><Flag size={15} aria-hidden="true" />PLANIFICA TU FUTURO</p><h1 id="savings-title">Metas de ahorro</h1><p className="page-subtitle">Convierte tus objetivos en pasos concretos y mira cómo crece tu acumulado.</p></div><span className="heading-accent" aria-hidden="true"><Flag size={22} /></span></header>
    <div className="savings-toolbar"><p className="savings-toolbar__copy">Los aportes reservan fondos; los retiros liberan solo lo acumulado.</p><div className="savings-toolbar__actions"><button className="button button--primary" type="button" onClick={() => setGoalForm(null)} disabled={goals.isMutating}><Plus size={17} aria-hidden="true" />Nueva meta</button></div></div>
    {actionError && <div className="notice notice--danger" role="alert">{actionError}</div>}
    {goals.status === 'loading' && <div className="savings-state-panel" role="status"><RefreshCw size={19} aria-hidden="true" />Cargando tus metas…</div>}
    {goals.status === 'error' && <div className="savings-state-panel savings-state-panel--error" role="alert"><CircleAlert size={21} aria-hidden="true" /><strong>No pudimos cargar tus metas.</strong><p>{errorMessage(goals.error)}</p><button className="button button--secondary" type="button" onClick={goals.retry}>Reintentar</button></div>}
    {goals.status === 'success' && goals.goals.length === 0 && <div className="savings-empty"><span><Flag size={25} aria-hidden="true" /></span><h2>Aún no tienes metas de ahorro</h2><p>Crea un objetivo y registra tus primeros aportes para empezar a verlo crecer.</p><button className="button button--primary" type="button" onClick={() => setGoalForm(null)}><Plus size={17} aria-hidden="true" />Crear primera meta</button></div>}
    {goals.status === 'success' && goals.goals.length > 0 && <div className="savings-grid" aria-label="Metas de ahorro">{goals.goals.map(goal => <GoalCard key={goal.id} goal={goal} busy={goals.isMutating} onEdit={() => setGoalForm(goal)} onEntry={type => setEntry({ goal, type })} onArchive={() => void toggleArchive(goal)} />)}</div>}
    {goalForm !== undefined && <GoalForm key={goalForm?.id ?? 'new-goal'} initial={goalForm} busy={goals.isMutating} onCancel={() => setGoalForm(undefined)} onSave={saveGoal} />}
    {entry && <EntryForm key={`${entry.goal.id}-${entry.type}`} goal={entry.goal} type={entry.type} busy={goals.isMutating} onCancel={() => setEntry(null)} onSave={saveEntry} />}
  </section>;
}
