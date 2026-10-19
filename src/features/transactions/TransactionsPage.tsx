import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, CalendarDays, Check, ChevronLeft, ChevronRight, CircleAlert, ListFilter, Pencil, Plus, RefreshCw, Search, Tags, Trash2, X } from 'lucide-react';
import { ApiError } from '../../shared/api/http';
import { useSession } from '../../shared/session/SessionProvider';
import { SignInPanel } from '../auth/SignInPanel';
import { formatBobMoney } from '../../shared/formatters/money';
import type { Category, Transaction, TransactionFilters, TransactionInput, TransactionType } from './api/contract';
import { createCategory, createTransaction, deleteCategory, listCategories, updateCategory, updateTransaction, voidTransaction } from './api/transactions';
import { useTransactions } from './hooks/useTransactions';
import './transactions.css';

const PAGE_SIZE = 10;
const BOLIVIA_ZONE = 'America/La_Paz';
const DATE_FORMATTER = new Intl.DateTimeFormat('es-BO', { timeZone: BOLIVIA_ZONE, day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

function currentLocalDateTime(): string {
  const parts = new Intl.DateTimeFormat('sv-SE', { timeZone: BOLIVIA_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

function toLocalDateTime(value: string): string {
  const parts = new Intl.DateTimeFormat('sv-SE', { timeZone: BOLIVIA_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

function toInstant(value: string): string {
  const parsed = new Date(`${value}:00-04:00`);
  if (Number.isNaN(parsed.getTime())) throw new Error('La fecha no es válida.');
  return parsed.toISOString();
}

function dateBoundary(value: string): string {
  return `${value}T04:00:00.000Z`;
}

function nextDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
}

function errorMessage(error: unknown, action: string): string {
  if (error instanceof ApiError) {
    if (error.kind === 'unauthenticated') return 'Tu sesión terminó. Inicia sesión de nuevo para continuar.';
    if (error.kind === 'conflict') return action === 'delete-category'
      ? 'No puedes eliminar esta categoría porque está vinculada a un presupuesto.'
      : 'Ya existe una categoría con ese nombre, o el movimiento cambió en otra solicitud.';
    if (error.kind === 'not-found') return 'No encontramos ese movimiento o categoría. Actualiza la lista e inténtalo de nuevo.';
    if (error.kind === 'validation') return 'Revisa los datos ingresados: el servidor no pudo aceptar la solicitud.';
    if (error.kind === 'timeout') return 'La conexión está tardando más de lo esperado. Vuelve a intentarlo.';
    if (error.kind === 'configuration') return 'La API no está configurada en este entorno.';
  }
  return 'No pudimos completar la solicitud. Revisa tu conexión e inténtalo de nuevo.';
}

function MovementForm({ initial, categories, busy, onCancel, onSave }: {
  initial: Transaction | null;
  categories: Category[];
  busy: boolean;
  onCancel(): void;
  onSave(value: TransactionInput): Promise<void>;
}) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense');
  const [amount, setAmount] = useState(initial?.amount ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [occurredAt, setOccurredAt] = useState(initial ? toLocalDateTime(initial.occurredAt) : currentLocalDateTime());
  const [description, setDescription] = useState(initial?.description ?? '');
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!/^(?:0|[1-9]\d{0,11})\.\d{2}$/.test(amount) || /^0+\.00$/.test(amount)) {
      setError('Ingresa un importe positivo con dos decimales, por ejemplo 150.25.');
      return;
    }
    if (!occurredAt) { setError('Selecciona la fecha y hora del movimiento.'); return; }
    try {
      await onSave({ type, amount, categoryId: categoryId || null, occurredAt: toInstant(occurredAt), description: description.trim() || null });
    } catch (cause) {
      setError(errorMessage(cause, 'save'));
    }
  }

  return <div className="transaction-overlay">
    <section className="transaction-dialog" role="dialog" aria-modal="true" aria-labelledby="movement-dialog-title">
      <div className="transaction-dialog__header"><div><span className="eyebrow">{initial ? 'ACTUALIZAR REGISTRO' : 'NUEVO REGISTRO'}</span><h2 id="movement-dialog-title">{initial ? 'Editar movimiento' : 'Agregar movimiento'}</h2></div><button className="icon-button" type="button" onClick={onCancel} aria-label="Cerrar formulario"><X size={19} /></button></div>
      <form onSubmit={event => void submit(event)} noValidate>
        <fieldset className="movement-type">
          <legend>Tipo de movimiento</legend>
          <button type="button" className={type === 'expense' ? 'movement-type__choice is-selected' : 'movement-type__choice'} aria-pressed={type === 'expense'} onClick={() => setType('expense')}><ArrowUpRight size={18} />Gasto</button>
          <button type="button" className={type === 'income' ? 'movement-type__choice is-selected' : 'movement-type__choice'} aria-pressed={type === 'income'} onClick={() => setType('income')}><ArrowDownLeft size={18} />Ingreso</button>
        </fieldset>
        <div className="movement-form-grid">
          <label className="field field--wide" htmlFor="movement-amount">Importe <span>BOB</span><input autoFocus id="movement-amount" inputMode="decimal" autoComplete="off" placeholder="0.00" value={amount} onChange={event => setAmount(event.target.value)} maxLength={15} required /></label>
          <label className="field" htmlFor="movement-category">Categoría<select id="movement-category" value={categoryId} onChange={event => setCategoryId(event.target.value)}><option value="">Sin categoría</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="field" htmlFor="movement-date">Fecha y hora<input id="movement-date" type="datetime-local" value={occurredAt} onChange={event => setOccurredAt(event.target.value)} required /></label>
          <label className="field field--wide" htmlFor="movement-description">Descripción <span>Opcional · hasta 500 caracteres</span><textarea id="movement-description" rows={3} maxLength={500} value={description} onChange={event => setDescription(event.target.value)} placeholder="Añade un detalle para recordar este movimiento" /></label>
        </div>
        {error && <p className="notice notice--danger" role="alert">{error}</p>}
        <div className="transaction-dialog__actions"><button className="button button--secondary" type="button" onClick={onCancel} disabled={busy}>Cancelar</button><button className="button button--primary" type="submit" disabled={busy}>{busy ? 'Guardando…' : initial ? 'Guardar cambios' : 'Agregar movimiento'}<Check size={17} aria-hidden="true" /></button></div>
      </form>
    </section>
  </div>;
}

function CategoryManager({ token, categories, onChanged, expire }: { token: string; categories: Category[]; onChanged(): void; expire(token: string): void }) {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Escribe un nombre para la categoría.'); return; }
    setBusy(true); setError(null);
    try {
      await createCategory(token, trimmed);
      setName('');
      onChanged();
    } catch (cause) {
      if (cause instanceof ApiError && cause.kind === 'unauthenticated') expire(token);
      setError(errorMessage(cause, 'save'));
    } finally { setBusy(false); }
  }

  async function renameCategory(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setBusy(true); setError(null);
    try {
      await updateCategory(token, id, editingName.trim());
      setEditingId(null);
      onChanged();
    } catch (cause) {
      if (cause instanceof ApiError && cause.kind === 'unauthenticated') expire(token);
      setError(errorMessage(cause, 'save'));
    } finally { setBusy(false); }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true); setError(null);
    try {
      await deleteCategory(token, deleting.id);
      setDeleting(null);
      onChanged();
    } catch (cause) {
      if (cause instanceof ApiError && cause.kind === 'unauthenticated') expire(token);
      setError(errorMessage(cause, 'delete-category'));
    } finally { setBusy(false); }
  }

  return <details className="category-manager">
    <summary><span className="category-manager__title"><Tags size={18} aria-hidden="true" />Administrar categorías</span><span className="category-manager__count">{categories.length}</span></summary>
    <div className="category-manager__body">
      <p className="muted">Tus categorías son privadas. Si eliminas una, sus movimientos quedarán sin categoría.</p>
      <form className="category-create" onSubmit={event => void saveCategory(event)}><label className="sr-only" htmlFor="new-category">Nombre de categoría</label><input id="new-category" value={name} maxLength={100} onChange={event => setName(event.target.value)} placeholder="Nueva categoría" required /><button className="button button--secondary" type="submit" disabled={busy}><Plus size={16} />Agregar</button></form>
      {error && <p className="notice notice--danger" role="alert">{error}</p>}
      {categories.length === 0 ? <p className="category-manager__empty">Aún no tienes categorías propias.</p> : <ul className="category-list">{categories.map(category => <li key={category.id}>
        {editingId === category.id ? <form className="category-rename" onSubmit={event => void renameCategory(event, category.id)}><label className="sr-only" htmlFor={`rename-${category.id}`}>Nuevo nombre para {category.name}</label><input id={`rename-${category.id}`} value={editingName} maxLength={100} onChange={event => setEditingName(event.target.value)} required /><button className="icon-button" type="submit" disabled={busy} aria-label="Guardar nombre"><Check size={17} /></button><button className="icon-button" type="button" onClick={() => setEditingId(null)} aria-label="Cancelar edición"><X size={17} /></button></form>
          : <><span>{category.name}</span><div className="category-list__actions"><button className="icon-button" type="button" aria-label={`Editar ${category.name}`} onClick={() => { setEditingId(category.id); setEditingName(category.name); }}><Pencil size={16} /></button><button className="icon-button" type="button" aria-label={`Eliminar ${category.name}`} onClick={() => setDeleting(category)}><Trash2 size={16} /></button></div></>}
      </li>)}</ul>}
    </div>
    {deleting && <div className="transaction-overlay"><section className="transaction-dialog transaction-dialog--confirm" role="alertdialog" aria-modal="true" aria-labelledby="delete-category-title"><h2 id="delete-category-title">¿Eliminar “{deleting.name}”?</h2><p>Los movimientos asociados se conservarán y quedarán sin categoría. Si tiene un presupuesto asignado, no se podrá eliminar.</p>{error && <p className="notice notice--danger" role="alert">{error}</p>}<div className="transaction-dialog__actions"><button className="button button--secondary" type="button" onClick={() => { setDeleting(null); setError(null); }} disabled={busy}>Cancelar</button><button className="button button--primary" type="button" onClick={() => void confirmDelete()} disabled={busy}>{busy ? 'Eliminando…' : 'Eliminar categoría'}</button></div></section></div>}
  </details>;
}

function TransactionsContent() {
  const { session, expire } = useSession();
  const token = session?.token;
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [type, setType] = useState<TransactionFilters['type']>('all');
  const [status, setStatus] = useState<TransactionFilters['status']>('posted');
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState<TransactionFilters>({ status: 'posted', page: 1, pageSize: PAGE_SIZE });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [mutationBusy, setMutationBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoryAttempt, setCategoryAttempt] = useState(0);
  const filters = useMemo(() => applied, [applied]);
  const result = useTransactions(filters);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    listCategories(token, controller.signal).then(values => {
      if (!controller.signal.aborted) { setCategories(values); setCategoryError(null); }
    }).catch(cause => {
      if (controller.signal.aborted) return;
      if (cause instanceof ApiError && cause.kind === 'unauthenticated') { expire(token); return; }
      setCategoryError(errorMessage(cause, 'load'));
    });
    return () => controller.abort();
  }, [token, categoryAttempt, expire]);

  function refreshCategories() {
    setCategoryError(null);
    setCategoryAttempt(value => value + 1);
    result.retry();
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (fromDate && toDate && fromDate > toDate) { setActionError('La fecha inicial no puede ser posterior a la fecha final.'); return; }
    setActionError(null);
    setApplied({
      ...(fromDate ? { from: dateBoundary(fromDate) } : {}),
      ...(toDate ? { to: dateBoundary(nextDate(toDate)) } : {}),
      type,
      status,
      ...(search.trim() ? { q: search.trim() } : {}),
      page: 1,
      pageSize: PAGE_SIZE,
    });
  }

  async function saveMovement(value: TransactionInput) {
    if (!token) return;
    setMutationBusy(true); setActionError(null);
    try {
      if (editing) await updateTransaction(token, editing.id, value);
      else await createTransaction(token, value);
      setDialogOpen(false);
      setEditing(null);
      result.retry();
    } catch (cause) {
      if (cause instanceof ApiError && cause.kind === 'unauthenticated') expire(token);
      throw cause;
    } finally { setMutationBusy(false); }
  }

  async function removeMovement(transaction: Transaction) {
    if (!token || !window.confirm('¿Anular este movimiento? Se conservará en el historial y dejará de contar en el panel.')) return;
    setMutationBusy(true); setActionError(null);
    try {
      await voidTransaction(token, transaction.id);
      result.retry();
    } catch (cause) {
      if (cause instanceof ApiError && cause.kind === 'unauthenticated') expire(token);
      setActionError(errorMessage(cause, 'void'));
    } finally { setMutationBusy(false); }
  }

  const data = result.status === 'success' ? result.data : null;
  return <div className="transactions-page">
    <div className="page-heading"><div><p className="eyebrow">TU HISTORIAL FINANCIERO</p><h1>Movimientos</h1><p className="page-subtitle">Registra y organiza tus ingresos y gastos, a tu ritmo.</p></div><span className="heading-accent" aria-hidden="true"><ArrowLeftRight size={25} strokeWidth={1.5} /></span></div>
    {!token ? <SignInPanel /> : <>
      <div className="transaction-toolbar"><div><span className="transaction-toolbar__label"><CalendarDays size={16} />BOB · Bolivia</span><p>Los cambios actualizan también tu panel principal.</p></div><button className="button button--primary" type="button" onClick={() => { setEditing(null); setActionError(null); setDialogOpen(true); }}><Plus size={18} />Agregar movimiento</button></div>
      <CategoryManager token={token} categories={categories} onChanged={refreshCategories} expire={expire} />
      {categoryError && <p className="notice notice--danger" role="alert">{categoryError} <button className="text-button" type="button" onClick={refreshCategories}>Reintentar</button></p>}
      <form className="transaction-filters" onSubmit={applyFilters}>
        <div className="transaction-filters__heading"><div><ListFilter size={18} aria-hidden="true" /><h2>Buscar movimientos</h2></div><button className="button button--secondary transaction-refresh" type="button" onClick={result.retry} disabled={result.status === 'loading'} aria-label="Actualizar movimientos"><RefreshCw size={16} className={result.status === 'loading' ? 'spinning' : undefined} />Actualizar</button></div>
        <div className="transaction-filter-grid">
          <label className="field" htmlFor="filter-from">Desde<input id="filter-from" type="date" value={fromDate} onChange={event => setFromDate(event.target.value)} /></label>
          <label className="field" htmlFor="filter-to">Hasta<input id="filter-to" type="date" value={toDate} onChange={event => setToDate(event.target.value)} /></label>
          <label className="field" htmlFor="filter-type">Tipo<select id="filter-type" value={type} onChange={event => setType(event.target.value as TransactionFilters['type'])}><option value="all">Todos</option><option value="income">Ingresos</option><option value="expense">Gastos</option></select></label>
          <label className="field" htmlFor="filter-status">Estado<select id="filter-status" value={status} onChange={event => setStatus(event.target.value as TransactionFilters['status'])}><option value="posted">Vigentes</option><option value="void">Anulados</option><option value="all">Todos</option></select></label>
          <label className="field transaction-search" htmlFor="filter-search">Descripción o categoría<span className="transaction-search__input"><Search size={17} aria-hidden="true" /><input id="filter-search" type="search" maxLength={100} value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar en tus movimientos" /></span></label>
          <button className="button button--primary transaction-filter-submit" type="submit">Aplicar filtros</button>
        </div>
        {actionError && <p className="notice notice--danger" role="alert">{actionError}</p>}
      </form>
      <section className="transaction-results" aria-labelledby="transaction-list-title" aria-busy={result.status === 'loading'}>
        <div className="transaction-results__heading"><div><h2 id="transaction-list-title">Tu actividad</h2><p>{data ? `${data.totalItems} ${data.totalItems === 1 ? 'movimiento' : 'movimientos'}` : 'Movimientos recientes'}</p></div></div>
        {result.status === 'loading' && <div className="transaction-state" role="status"><span className="sr-only">Cargando movimientos…</span><div className="transaction-skeleton" /><div className="transaction-skeleton" /><div className="transaction-skeleton" /></div>}
        {result.status === 'error' && <div className="transaction-state transaction-state--error" role="alert"><CircleAlert size={27} /><strong>No pudimos cargar tus movimientos</strong><p>{errorMessage(result.error, 'load')}</p><button className="button button--secondary" type="button" onClick={result.retry}>Volver a intentar</button></div>}
        {result.status === 'success' && result.data.items.length === 0 && <div className="transaction-state transaction-state--empty"><span className="transaction-empty-icon"><ArrowLeftRight size={22} /></span><h3>{applied.q || applied.from || applied.to || applied.type !== 'all' ? 'No hay resultados con estos filtros' : 'Todavía no hay movimientos'}</h3><p>{applied.q || applied.from || applied.to || applied.type !== 'all' ? 'Prueba otros filtros o amplía el período.' : 'Cuando registres un ingreso o gasto, aparecerá aquí.'}</p>{!applied.q && !applied.from && !applied.to && applied.type === 'all' && <button className="button button--primary" type="button" onClick={() => setDialogOpen(true)}><Plus size={17} />Agregar primer movimiento</button>}</div>}
        {data && data.items.length > 0 && <>
          <ul className="transaction-list">{data.items.map(transaction => <li className={`transaction-row transaction-row--${transaction.type}${transaction.status === 'void' ? ' transaction-row--void' : ''}`} key={transaction.id}>
            <span className="transaction-row__icon" aria-hidden="true">{transaction.type === 'income' ? <ArrowDownLeft size={19} /> : <ArrowUpRight size={19} />}</span>
            <div className="transaction-row__details"><div className="transaction-row__title"><strong>{transaction.description || (transaction.type === 'income' ? 'Ingreso' : 'Gasto')}</strong>{transaction.status === 'void' && <span className="transaction-status">Anulado</span>}</div><span>{transaction.categoryName ?? 'Sin categoría'} · <time dateTime={transaction.occurredAt}>{DATE_FORMATTER.format(new Date(transaction.occurredAt))}</time></span></div>
            <strong className="transaction-row__amount">{transaction.type === 'income' ? '+' : '−'}{formatBobMoney(transaction.amount)}</strong>
            {transaction.status === 'posted' && <div className="transaction-row__actions"><button className="icon-button" type="button" aria-label={`Editar ${transaction.description || transaction.type}`} disabled={mutationBusy} onClick={() => { setEditing(transaction); setActionError(null); setDialogOpen(true); }}><Pencil size={16} /></button><button className="icon-button" type="button" aria-label={`Anular ${transaction.description || transaction.type}`} disabled={mutationBusy} onClick={() => void removeMovement(transaction)}><Trash2 size={16} /></button></div>}
          </li>)}</ul>
          {data.totalPages > 1 && <nav className="transaction-pagination" aria-label="Paginación de movimientos"><button className="button button--secondary" type="button" disabled={applied.page <= 1 || result.status === 'loading'} onClick={() => setApplied(previous => ({ ...previous, page: previous.page - 1 }))}><ChevronLeft size={17} />Anterior</button><span>Página {data.page} de {data.totalPages}</span><button className="button button--secondary" type="button" disabled={data.page >= data.totalPages || result.status === 'loading'} onClick={() => setApplied(previous => ({ ...previous, page: previous.page + 1 }))}>Siguiente<ChevronRight size={17} /></button></nav>}
        </>}
      </section>
    </>}
    {dialogOpen && <MovementForm initial={editing} categories={categories} busy={mutationBusy} onCancel={() => { setDialogOpen(false); setEditing(null); }} onSave={saveMovement} />}
  </div>;
}

export function TransactionsPage() {
  const { session } = useSession();
  return session ? <TransactionsContent key={session.token} /> : <div className="transactions-page"><div className="page-heading"><div><p className="eyebrow">TU HISTORIAL FINANCIERO</p><h1>Movimientos</h1><p className="page-subtitle">Inicia sesión para consultar tus ingresos y gastos.</p></div><span className="heading-accent" aria-hidden="true"><ArrowLeftRight size={25} /></span></div><SignInPanel /></div>;
}
