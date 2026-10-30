import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { SessionProvider, useSession } from '../../shared/session/SessionProvider';
import { deferred, jsonResponse, sessionResponse } from '../../test/fixtures';
import { BudgetsPage } from './BudgetsPage';
import type { Budget } from './api/contract';

// Synthetic data, deliberately distinct from a second account's empty data.
const category = { id: '22222222-2222-4222-8222-222222222222', name: 'Categoría privada A' };
const budget: Budget = { id: '11111111-1111-4111-8111-111111111111', categoryId: category.id, categoryName: category.name, limit: '100.00', spent: '80.00', remaining: '20.00', progress: '80.00', state: 'warning' };
function Controls() {
  const { signIn, session, expire } = useSession();
  return <><button onClick={() => void signIn('a@fintrack.test', 'synthetic-password')}>Entrar A</button><button onClick={() => void signIn('b@fintrack.test', 'synthetic-password')}>Entrar B</button><button onClick={() => session && expire(session.token)}>Vencer sesión</button></>;
}
function renderPage() { return render(<MemoryRouter><SessionProvider><Controls /><BudgetsPage /></SessionProvider></MemoryRouter>); }
beforeEach(() => vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3100/api/v1'));
function mockRequests() {
  const fetcher = vi.fn(async (input: string | URL | Request, options?: RequestInit) => {
    const url = String(input);
    if (url.endsWith('/auth/login')) return sessionResponse(JSON.parse(String(options?.body)).email.startsWith('a@') ? 'a-token' : 'b-token');
    const isA = new Headers(options?.headers).get('Authorization') === 'Bearer a-token';
    return jsonResponse(isA ? (url.endsWith('/categories') ? [category] : [budget]) : []);
  });
  vi.stubGlobal('fetch', fetcher); return fetcher;
}
it.each(['Editar', 'Eliminar presupuesto de Categoría privada A'])('discards private budget dialog %s on account change', async action => {
  mockRequests(); const user = userEvent.setup(); renderPage();
  await user.click(screen.getByRole('button', { name: 'Entrar A' }));
  await user.click(await screen.findByRole('button', { name: action }));
  expect(screen.queryByRole('dialog') ?? screen.getByRole('alertdialog')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Vencer sesión' }));
  await user.click(screen.getByRole('button', { name: 'Entrar B' }));
  await screen.findByText(/Aún no hay presupuestos/);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  expect(screen.queryByText(category.name, { exact: false })).not.toBeInTheDocument();
});
it('keeps a valid budget period when the month input is cleared', async () => {
  const fetcher = mockRequests(); const user = userEvent.setup(); renderPage();
  await user.click(screen.getByRole('button', { name: 'Entrar A' }));
  await screen.findByRole('heading', { name: category.name });
  const input = screen.getByLabelText('Período'); const previous = (input as HTMLInputElement).value;
  fireEvent.change(input, { target: { value: '' } });
  expect(screen.getByRole('heading', { name: 'Presupuestos' })).toBeVisible();
  expect(input).toHaveValue(previous);
  expect(fetcher.mock.calls.filter(([url]) => String(url).includes('/budgets?')).every(([url]) => Boolean(new URL(String(url)).searchParams.get('month')))).toBe(true);
});


function installBudgets(initial: Budget[] = []) {
  const store = { budgets: initial, categories: [category], categoryStatus: 200, listStatus: 200, mutationStatus: 200, listCalls: 0 };
  const fetcher = vi.fn(async (input: string | URL | Request, options?: RequestInit) => {
    const url = String(input); const method = options?.method ?? 'GET';
    if (url.endsWith('/auth/login')) return sessionResponse('a-token');
    if (url.endsWith('/categories')) return jsonResponse(store.categories, store.categoryStatus);
    if (method === 'GET') { store.listCalls++; return jsonResponse(store.budgets, store.listStatus); }
    if (store.mutationStatus !== 200) return jsonResponse({}, store.mutationStatus);
    if (method === 'DELETE') { store.budgets = []; return new Response(null, { status: 204 }); }
    const body = JSON.parse(String(options?.body));
    const result = { ...budget, ...body }; delete result.month;
    store.budgets = [result]; return jsonResponse(result, method === 'POST' ? 201 : 200);
  });
  vi.stubGlobal('fetch', fetcher); return { store, fetcher };
}
async function enterBudgets(user: ReturnType<typeof userEvent.setup>) {
  renderPage(); await user.click(screen.getByRole('button', { name: 'Entrar A' }));
  await waitFor(() => expect(screen.queryByText(/Cargando presupuestos de/)).not.toBeInTheDocument());
}

it('rejects zero or malformed limits and missing category locally, then preserves a duplicate conflict', async () => {
  const { store, fetcher } = installBudgets(); const user = userEvent.setup(); await enterBudgets(user);
  await user.click(screen.getByRole('button', { name: 'Nuevo presupuesto' }));
  const submit = within(screen.getByRole('dialog')).getByRole('button', { name: 'Crear presupuesto' });
  for (const invalid of ['0.00', '-1.00', '100', '1.001']) {
    fireEvent.change(screen.getByLabelText(/Límite mensual/), { target: { value: invalid } }); await user.click(submit);
    expect(screen.getByRole('alert')).toHaveTextContent('límite positivo con dos decimales');
  }
  fireEvent.change(screen.getByLabelText(/Límite mensual/), { target: { value: '100.00' } }); await user.click(submit);
  expect(screen.getByRole('alert')).toHaveTextContent('Selecciona una categoría.');
  expect(fetcher.mock.calls.filter(([url, options]) => options?.method === 'POST' && String(url).endsWith('/budgets'))).toHaveLength(0);
  await user.selectOptions(screen.getByLabelText('Categoría'), category.id); store.mutationStatus = 409;
  await user.click(submit);
  expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe un presupuesto');
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(screen.queryByRole('heading', { name: category.name })).not.toBeInTheDocument();
});

it('disables creation without categories', async () => {
  const { store } = installBudgets(); store.categories = []; const user = userEvent.setup(); await enterBudgets(user);
  expect(screen.getByText(/Primero crea una categoría/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Nuevo presupuesto' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Crear presupuesto' })).toBeDisabled();
});

it('recovers a failed category catalog without treating the error as an empty catalog', async () => {
  const { store } = installBudgets(); store.categoryStatus = 500; const user = userEvent.setup(); await enterBudgets(user);
  expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar las categorías.');
  expect(screen.queryByText(/Primero crea una categoría/)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Nuevo presupuesto' })).toBeDisabled();
  store.categoryStatus = 200; await user.click(screen.getByRole('button', { name: 'Reintentar' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Nuevo presupuesto' })).toBeEnabled());
});

it('presents received states at 79.99, 80, 100 and above 100 percent without overflowing', async () => {
  const rows: Budget[] = [
    { ...budget, categoryName: 'Bajo umbral', spent: '79.99', remaining: '20.01', progress: '79.99', state: 'normal' },
    { ...budget, id: '33333333-3333-4333-8333-333333333333', categoryName: 'Atención ochenta', progress: '80.00', state: 'warning' },
    { ...budget, id: '44444444-4444-4444-8444-444444444444', categoryName: 'Límite exacto', spent: '100.00', remaining: '0.00', progress: '100.00', state: 'warning' },
    { ...budget, id: '55555555-5555-4555-8555-555555555555', categoryName: 'Con exceso', spent: '100.01', remaining: '-0.01', progress: '100.01', state: 'exceeded' },
  ];
  installBudgets(rows); const user = userEvent.setup(); await enterBudgets(user);
  for (const row of rows) {
    const card = screen.getByRole('heading', { name: row.categoryName }).closest('article')!;
    expect(within(card).getByText(`${row.progress.replace('.', ',')} %`)).toBeVisible();
    const label = row.state === 'normal' ? 'En rango' : row.state === 'warning' ? 'Atención' : 'Excedido';
    expect(within(card).getByText(label)).toBeVisible();
    const progress = within(card).getByRole('img');
    expect(progress.firstElementChild).toHaveStyle(`width: ${row.progress === '100.01' ? '100' : Number(row.progress)}%`);
  }
  const exceeded = screen.getByRole('heading', { name: 'Con exceso' }).closest('article')!;
  expect(within(exceeded).getByText(/Exceso/)).toBeVisible();
  expect(within(exceeded).getByText('−Bs. 0,01')).toBeVisible();
});

it('cancels deletion without DELETE and keeps a failed confirmation recoverable', async () => {
  const { store, fetcher } = installBudgets([budget]); const user = userEvent.setup(); await enterBudgets(user);
  await user.click(screen.getByRole('button', { name: `Eliminar presupuesto de ${category.name}` }));
  await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancelar' }));
  expect(fetcher.mock.calls.some(([, options]) => options?.method === 'DELETE')).toBe(false);
  await user.click(screen.getByRole('button', { name: `Eliminar presupuesto de ${category.name}` })); store.mutationStatus = 500;
  await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Eliminar presupuesto' }));
  const dialog = await screen.findByRole('alertdialog');
  expect(await within(dialog).findByRole('alert')).toHaveTextContent('No pudimos completar la solicitud.');
  expect(screen.getByRole('heading', { name: category.name })).toBeVisible();
  store.mutationStatus = 200;
  await user.click(within(dialog).getByRole('button', { name: 'Eliminar presupuesto' }));
  expect(await screen.findByText(/Aún no hay presupuestos/)).toBeVisible();
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
});

it('ignores a late month response after a more recent period has loaded', async () => {
  const january = deferred<Response>();
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
    const url = String(input);
    if (url.endsWith('/auth/login')) return sessionResponse('a-token');
    if (url.endsWith('/categories')) return jsonResponse([category]);
    if (new URL(url).searchParams.get('month') === '2026-01') return january.promise;
    return jsonResponse([{ ...budget, categoryName: new URL(url).searchParams.get('month') === '2026-02' ? 'Febrero vigente' : category.name }]);
  }));
  const user = userEvent.setup(); await enterBudgets(user);
  fireEvent.change(screen.getByLabelText('Período'), { target: { value: '2026-01' } });
  expect(screen.getByText(/Cargando presupuestos de enero/)).toBeVisible();
  fireEvent.change(screen.getByLabelText('Período'), { target: { value: '2026-02' } });
  await screen.findByRole('heading', { name: 'Febrero vigente' });
  await act(async () => january.resolve(jsonResponse([{ ...budget, categoryName: 'Enero obsoleto' }])));
  expect(screen.queryByText('Enero obsoleto')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Febrero vigente' })).toBeVisible();
});

it('ignores a previous account list that resolves after the next account loads', async () => {
  const pending = deferred<Response>();
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request, options?: RequestInit) => {
    const url = String(input);
    if (url.endsWith('/auth/login')) return sessionResponse(JSON.parse(String(options?.body)).email.startsWith('a@') ? 'a-token' : 'b-token');
    if (url.endsWith('/categories')) return jsonResponse([category]);
    return new Headers(options?.headers).get('Authorization') === 'Bearer a-token' ? pending.promise : jsonResponse([]);
  }));
  const user = userEvent.setup(); renderPage(); await user.click(screen.getByRole('button', { name: 'Entrar A' }));
  expect(screen.getByText(/Cargando presupuestos de/)).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Entrar B' }));
  await screen.findByText(/Aún no hay presupuestos/);
  await act(async () => pending.resolve(jsonResponse([budget])));
  expect(screen.queryByRole('heading', { name: category.name })).not.toBeInTheDocument();
});



it('does not close B’s budget editor when A’s pending deletion finishes', async () => {
  const pending = deferred<Response>(); const bBudget = { ...budget, categoryName: 'Presupuesto propio B', limit: '250.00' }; let bReads = 0;
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request, options?: RequestInit) => {
    const url = String(input);
    if (url.endsWith('/auth/login')) return sessionResponse(JSON.parse(String(options?.body)).email.startsWith('a@') ? 'a-token' : 'b-token');
    if (url.endsWith('/categories')) return jsonResponse([category]);
    if (options?.method === 'DELETE') return pending.promise;
    const isA = new Headers(options?.headers).get('Authorization') === 'Bearer a-token';
    if (!isA) bReads++;
    return jsonResponse(isA ? [budget] : [bBudget]);
  }));
  const user = userEvent.setup(); await enterBudgets(user);
  await user.click(screen.getByRole('button', { name: `Eliminar presupuesto de ${category.name}` }));
  await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Eliminar presupuesto' }));
  await user.click(screen.getByRole('button', { name: 'Vencer sesión' }));
  await user.click(screen.getByRole('button', { name: 'Entrar B' }));
  await screen.findByRole('heading', { name: bBudget.categoryName });
  await user.click(screen.getByRole('button', { name: 'Editar' }));
  await act(async () => pending.resolve(new Response(null, { status: 204 })));
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(screen.getByLabelText(/Límite mensual/)).toHaveValue('250.00');
  expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled();
  expect(bReads).toBe(1);
});
