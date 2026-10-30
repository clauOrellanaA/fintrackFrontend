import { useCallback, useState, type FormEvent } from 'react';
import { AlertTriangle, Check, CircleAlert, Pencil, Plus, RefreshCw, Target, Trash2, Wallet, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApiError } from '../../shared/api/http';
import { formatBobMoney } from '../../shared/formatters/money';
import { useSession } from '../../shared/session/SessionProvider';
import { SignInPanel } from '../auth/SignInPanel';
import { currentMonth, monthLabel } from '../dashboard/lib/period';
import type { Category } from '../transactions/api/contract';
import { useCategories } from '../transactions/hooks/useCategories';
import type { Budget, CreateBudgetInput } from './api/contract';
import { useBudgets } from './hooks/useBudgets';
import './budgets.css';

const noop = () => undefined;
const LIMIT_PATTERN = /^(?:0|[1-9]\d{0,11})\.\d{2}$/;
const stateLabels = { normal: 'En rango', warning: 'Atención', exceeded: 'Excedido' } as const;

function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return 'No pudimos completar la solicitud. Revisa tu conexión e inténtalo de nuevo.';
  if (error.kind === 'unauthenticated') return 'Tu sesión terminó. Inicia sesión de nuevo para continuar.';
  if (error.kind === 'conflict') return 'Ya existe un presupuesto para esa categoría y ese mes.';
  if (error.kind === 'not-found') return 'No encontramos esa categoría o presupuesto. Actualiza la lista e inténtalo de nuevo.';
  if (error.kind === 'validation') return 'Revisa el mes y el límite ingresados.';
  if (error.kind === 'timeout') return 'La conexión está tardando más de lo esperado. Vuelve a intentarlo.';
  if (error.kind === 'configuration') return 'La API no está configurada en este entorno.';
  return 'No pudimos completar la solicitud. Revisa tu conexión e inténtalo de nuevo.';
}

function BudgetForm({ initial, categories, month, busy, onCancel, onSave }: {
  initial: Budget | null;
  categories: Category[];
  month: string;
  busy: boolean;
  onCancel(): void;
  onSave(input: CreateBudgetInput | { limit: string }): Promise<void>;
}) {
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [limit, setLimit] = useState(initial?.limit ?? '');
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!LIMIT_PATTERN.test(limit) || /^0+\.00$/.test(limit)) {
      setError('Ingresa un límite positivo con dos decimales, por ejemplo 500.00.');
      return;
    }
    if (initial) {
      try { await onSave({ limit }); }
      catch (cause) { setError(errorMessage(cause)); }
      return;
    }
    if (!categoryId) { setError('Selecciona una categoría.'); return; }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(selectedMonth)) { setError('Selecciona un mes válido.'); return; }
    try { await onSave({ categoryId, month: selectedMonth, limit }); }
    catch (cause) { setError(errorMessage(cause)); }
  }

  return <div className="budget-overlay">
    <section className="budget-dialog" role="dialog" aria-modal="true" aria-labelledby="budget-dialog-title">
      <div className="budget-dialog__header">
        <div><span className="eyebrow">{initial ? 'AJUSTAR LÍMITE' : 'PLANIFICAR GASTOS'}</span><h2 id="budget-dialog-title">{initial ? 'Editar presupuesto' : 'Crear presupuesto'}</h2></div>
        <button className="icon-button" type="button" onClick={onCancel} aria-label="Cerrar formulario"><X size={19} aria-hidden="true" /></button>
      </div>
      <form onSubmit={event => void submit(event)} noValidate>
        {!initial && <div className="budget-form-grid">
          <label className="field" htmlFor="budget-category">Categoría
            <select autoFocus id="budget-category" value={categoryId} onChange={event => setCategoryId(event.target.value)} required>
              <option value="">Selecciona una categoría</option>
              {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="field" htmlFor="budget-month">Mes<input id="budget-month" type="month" min="1900-01" max="9998-12" value={selectedMonth} onChange={event => setSelectedMonth(event.target.value)} required /></label>
        </div>}
        <label className="field budget-limit-field" htmlFor="budget-limit">Límite mensual <span>Bolivianos · dos decimales</span>
          <div className="budget-limit-input"><span aria-hidden="true">Bs.</span><input autoFocus={Boolean(initial)} id="budget-limit" inputMode="decimal" autoComplete="off" placeholder="0.00" value={limit} onChange={event => setLimit(event.target.value)} maxLength={15} required /></div>
        </label>
        {error && <p className="notice notice--danger" role="alert">{error}</p>}
        <div className="budget-dialog__actions">
          <button className="button button--secondary" type="button" onClick={onCancel} disabled={busy}>Cancelar</button>
          <button className="button button--primary" type="submit" disabled={busy || (!initial && categories.length === 0)}>{busy ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear presupuesto'}<Check size={17} aria-hidden="true" /></button>
        </div>
      </form>
    </section>
  </div>;
}

function BudgetCard({ budget, month, onEdit, onDelete }: { budget: Budget; month: string; onEdit(): void; onDelete(): void }) {
  const progress = Math.min(Number(budget.progress), 100);
  const remainingLabel = budget.remaining.startsWith('-') ? 'Exceso' : 'Disponible';
  const notice = budget.state === 'warning'
    ? 'Has usado al menos el 80 % de este límite.'
    : budget.state === 'exceeded' ? 'Superaste el límite de este presupuesto.' : null;

  return <article className={`budget-card budget-card--${budget.state}`}>
    <div className="budget-card__top">
      <span className="budget-card__icon"><Wallet size={19} aria-hidden="true" /></span>
      <span className={`budget-state budget-state--${budget.state}`}>{budget.state === 'normal' ? null : <AlertTriangle size={14} aria-hidden="true" />}{stateLabels[budget.state]}</span>
    </div>
    <h2>{budget.categoryName}</h2>
    <p className="budget-card__month">{monthLabel(month)}</p>
    <div className="budget-card__amounts">
      <div><span>Gastado</span><strong className="financial-amount">{formatBobMoney(budget.spent)}</strong></div>
      <div><span>Límite</span><strong className="financial-amount">{formatBobMoney(budget.limit)}</strong></div>
    </div>
    <div className="budget-progress" role="img" aria-label={`Uso del presupuesto de ${budget.categoryName}: ${budget.progress.replace('.', ',')} por ciento, ${stateLabels[budget.state]}`}>
      <span style={{ width: `${progress}%` }} />
    </div>
    <div className="budget-card__summary"><span>{remainingLabel} <strong className="financial-amount">{formatBobMoney(budget.remaining)}</strong></span><strong>{budget.progress.replace('.', ',')} %</strong></div>
    {notice && <p className={`budget-card__notice budget-card__notice--${budget.state}`}><CircleAlert size={15} aria-hidden="true" />{notice}</p>}
    <div className="budget-card__actions">
      <button type="button" className="button button--secondary" onClick={onEdit}><Pencil size={15} aria-hidden="true" />Editar</button>
      <button type="button" className="button button--secondary" onClick={onDelete} aria-label={`Eliminar presupuesto de ${budget.categoryName}`}><Trash2 size={15} aria-hidden="true" />Eliminar</button>
    </div>
  </article>;
}

function BudgetsContent() {
  const { session, expire } = useSession();
  const [month, setMonth] = useState(currentMonth);
  const [dialogBudget, setDialogBudget] = useState<Budget | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Budget | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const onCategoriesChanged = useCallback(noop, []);
  const categories = useCategories(session?.token, expire, onCategoriesChanged);
  const budgets = useBudgets(month);

  if (!session) return <SignInPanel />;

  const canCreate = categories.status === 'success' && categories.categories.length > 0;

  async function save(input: CreateBudgetInput | { limit: string }) {
    if ('categoryId' in input) {
      await budgets.create(input);
    } else if (dialogBudget) {
      await budgets.update(dialogBudget.id, input.limit);
    }
    setDialogBudget(undefined);
    setActionError(null);
  }

  async function removeBudget() {
    if (!deleting) return;
    try {
      await budgets.remove(deleting.id);
      setDeleting(null);
      setActionError(null);
    } catch (error) {
      setActionError(errorMessage(error));
    }
  }

  return <section className="budgets-page" aria-labelledby="budgets-title">
    <header className="page-heading">
      <div><p className="eyebrow"><Target size={15} aria-hidden="true" />ORGANIZA TUS GASTOS</p><h1 id="budgets-title">Presupuestos</h1><p className="page-subtitle">Define límites por categoría y mantén tus gastos del mes bajo control.</p></div>
      <span className="heading-accent" aria-hidden="true"><Wallet size={22} /></span>
    </header>

    <div className="budgets-toolbar">
      <label className="budget-month" htmlFor="budgets-month"><span>Período</span><input id="budgets-month" type="month" min="1900-01" max="9998-12" value={month} onChange={event => { if (/^\d{4}-(0[1-9]|1[0-2])$/.test(event.target.value)) setMonth(event.target.value); }} /></label>
      <div className="budgets-toolbar__actions">
        <Link className="button button--secondary" to="/transactions">Ver movimientos</Link>
        <button className="button button--primary" type="button" onClick={() => setDialogBudget(null)} disabled={!canCreate || categories.isMutating}><Plus size={17} aria-hidden="true" />Nuevo presupuesto</button>
      </div>
    </div>

    {categories.status === 'error' && <div className="notice notice--danger" role="alert"><p>No pudimos cargar las categorías. <button className="text-button" type="button" onClick={categories.retry}>Reintentar</button></p></div>}
    {categories.status === 'success' && categories.categories.length === 0 && <div className="notice notice--warning" role="status">Primero crea una categoría para asignarle un presupuesto. <Link to="/transactions">Ir a movimientos</Link></div>}
    {actionError && <div className="notice notice--danger" role="alert">{actionError}</div>}
    {budgets.status === 'loading' && <div className="budget-state-panel" role="status"><RefreshCw size={19} aria-hidden="true" />Cargando presupuestos de {monthLabel(month)}…</div>}
    {budgets.status === 'error' && <div className="budget-state-panel budget-state-panel--error" role="alert"><CircleAlert size={21} aria-hidden="true" /><strong>No pudimos cargar tus presupuestos.</strong><p>{errorMessage(budgets.error)}</p><button className="button button--secondary" type="button" onClick={budgets.retry}>Reintentar</button></div>}
    {budgets.status === 'success' && budgets.budgets.length === 0 && <div className="budget-empty">
      <span><Target size={25} aria-hidden="true" /></span><h2>Aún no hay presupuestos para {monthLabel(month)}</h2><p>Asigna un límite mensual a una categoría para empezar a dar seguimiento a tus gastos.</p>
      <button className="button button--primary" type="button" onClick={() => setDialogBudget(null)} disabled={!canCreate}><Plus size={17} aria-hidden="true" />Crear presupuesto</button>
    </div>}
    {budgets.status === 'success' && budgets.budgets.length > 0 && <div className="budget-grid" aria-label={`Presupuestos de ${monthLabel(month)}`}>
      {budgets.budgets.map(budget => <BudgetCard key={budget.id} budget={budget} month={month} onEdit={() => setDialogBudget(budget)} onDelete={() => setDeleting(budget)} />)}
    </div>}

    {dialogBudget !== undefined && <BudgetForm key={dialogBudget?.id ?? 'new-budget'} initial={dialogBudget} categories={categories.categories} month={month} busy={budgets.isMutating} onCancel={() => setDialogBudget(undefined)} onSave={save} />}
    {deleting && <div className="budget-overlay">
      <section className="budget-dialog budget-confirm" role="alertdialog" aria-modal="true" aria-labelledby="delete-budget-title" aria-describedby="delete-budget-description">
        <div className="budget-dialog__header"><div><span className="eyebrow">CONFIRMAR CAMBIO</span><h2 id="delete-budget-title">Eliminar presupuesto</h2></div></div>
        <p id="delete-budget-description">Se eliminará el límite de {deleting.categoryName} para {monthLabel(month)}. Los movimientos no se modificarán.</p>
        {actionError && <p className="notice notice--danger" role="alert">{actionError}</p>}
        <div className="budget-dialog__actions"><button className="button button--secondary" type="button" onClick={() => { setDeleting(null); setActionError(null); }} disabled={budgets.isMutating}>Cancelar</button><button autoFocus className="button button--danger" type="button" onClick={() => void removeBudget()} disabled={budgets.isMutating}>{budgets.isMutating ? 'Eliminando…' : 'Eliminar presupuesto'}</button></div>
      </section>
    </div>}
  </section>;
}

export function BudgetsPage() {
  const { session } = useSession();
  return session ? <BudgetsContent key={session.token} /> : <SignInPanel />;
}
