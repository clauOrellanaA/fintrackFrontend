import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { SessionProvider, useSession } from '../../shared/session/SessionProvider';
import { deferred, jsonResponse, sessionResponse } from '../../test/fixtures';
import { SavingsGoalsPage } from './SavingsGoalsPage';
import type { SavingsGoal } from './api/contract';

// Synthetic account and goal data; these tests do not exercise a live API.
const goal: SavingsGoal = { id: '11111111-1111-4111-8111-111111111111', name: 'Reserva privada A', target: '500.00', saved: '100.00', remaining: '400.00', progress: '20.00', state: 'active', targetDate: '2026-12-31', archived: false, createdAt: '2026-10-01T12:00:00-04:00', currency: 'BOB' };
function Controls() {
  const { signIn, signOut, session, expire } = useSession();
  return <><button onClick={() => void signIn('a@fintrack.test', 'synthetic-password')}>Entrar A</button><button onClick={() => void signIn('b@fintrack.test', 'synthetic-password')}>Entrar B</button><button onClick={() => void signOut()}>Salir de prueba</button><button onClick={() => session && expire(session.token)}>Vencer sesión</button><output aria-label="Sesión de prueba">{session?.email ?? 'Sin sesión'}</output></>;
}
function renderPage() { return render(<SessionProvider><Controls /><SavingsGoalsPage /></SessionProvider>); }
beforeEach(() => vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3100/api/v1'));

it.each(['Editar', 'Aportar', 'Retirar'])('removes the private %s dialog when another account signs in', async action => {
  const fetcher = vi.fn(async (input: string | URL | Request, options?: RequestInit) => {
    const url = String(input);
    if (url.endsWith('/auth/login')) return sessionResponse(JSON.parse(String(options?.body)).email.startsWith('a@') ? 'a-token' : 'b-token');
    if (url.endsWith('/auth/session')) return new Response(null, { status: 204 });
    return jsonResponse(new Headers(options?.headers).get('Authorization') === 'Bearer a-token' ? [goal] : []);
  });
  vi.stubGlobal('fetch', fetcher);
  const user = userEvent.setup(); renderPage();
  await user.click(screen.getByRole('button', { name: 'Entrar A' }));
  await user.click(await screen.findByRole('button', { name: action }));
  expect(screen.getByRole('dialog')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Vencer sesión' }));
  await user.click(screen.getByRole('button', { name: 'Entrar B' }));
  await screen.findByText('Aún no tienes metas de ahorro');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.queryByDisplayValue(goal.name)).not.toBeInTheDocument();
  expect(screen.queryByText(goal.name)).not.toBeInTheDocument();
});


function installGoals(initial: SavingsGoal[] = []) {
  const store = { goals: initial, mutationStatus: 200, listStatus: 200, listCalls: 0 };
  const fetcher = vi.fn(async (input: string | URL | Request, options?: RequestInit) => {
    const url = String(input); const method = options?.method ?? 'GET';
    if (url.endsWith('/auth/login')) return sessionResponse('a-token');
    if (url.endsWith('/auth/session')) return new Response(null, { status: 204 });
    if (method === 'GET') { store.listCalls++; return jsonResponse(store.goals, store.listStatus); }
    if (store.mutationStatus !== 200) return jsonResponse({}, store.mutationStatus);
    const body = JSON.parse(String(options?.body));
    if (method === 'POST' && url.endsWith('/savings-goals')) {
      const result = { ...goal, ...body, saved: '0.00', remaining: body.target, progress: '0.00' }; store.goals = [result]; return jsonResponse(result, 201);
    }
    if (method === 'PATCH') { const result = { ...store.goals[0], ...body }; store.goals = [result]; return jsonResponse(result); }
    if (url.endsWith('/entries')) {
      const result = { ...store.goals[0], saved: '125.50', remaining: '374.50', progress: '25.10' }; store.goals = [result];
      return jsonResponse({ entry: { id: '33333333-3333-4333-8333-333333333333', ...body, currency: 'BOB', occurredAt: '2026-10-30T12:00:00-04:00' }, goal: result }, 201);
    }
    throw new Error(`Unexpected synthetic request ${method} ${url}`);
  });
  vi.stubGlobal('fetch', fetcher); return { store, fetcher };
}
async function enterGoals(user: ReturnType<typeof userEvent.setup>) {
  renderPage(); await user.click(screen.getByRole('button', { name: 'Entrar A' }));
  await waitFor(() => expect(screen.queryByText('Cargando tus metas…')).not.toBeInTheDocument());
}

it('validates goal input locally, creates a trimmed name without a date and edits exact values', async () => {
  const { fetcher } = installGoals(); const user = userEvent.setup(); await enterGoals(user);
  await user.click(screen.getByRole('button', { name: 'Nueva meta' }));
  await user.type(screen.getByLabelText('Nombre de la meta'), '   ');
  await user.type(screen.getByLabelText(/Objetivo \(BOB\)/), '500.00');
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Crear meta' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Escribe un nombre');
  await user.clear(screen.getByLabelText('Nombre de la meta'));
  await user.type(screen.getByLabelText('Nombre de la meta'), '  Fondo futuro  ');
  for (const invalid of ['0.00', '-1.00', '500', '5.001']) {
    fireEvent.change(screen.getByLabelText(/Objetivo \(BOB\)/), { target: { value: invalid } });
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Crear meta' }));
    expect(screen.getByRole('alert')).toHaveTextContent('objetivo positivo con dos decimales');
  }
  expect(fetcher.mock.calls.filter(([, options]) => options?.method === 'POST' && !String(options.body).includes('password'))).toHaveLength(0);
  fireEvent.change(screen.getByLabelText(/Objetivo \(BOB\)/), { target: { value: '500.00' } });
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Crear meta' }));
  await screen.findByRole('heading', { name: 'Fondo futuro' });
  const create = fetcher.mock.calls.find(([url, options]) => String(url).endsWith('/savings-goals') && options?.method === 'POST');
  expect(JSON.parse(String(create?.[1]?.body))).toEqual({ name: 'Fondo futuro', target: '500.00', targetDate: null });
  expect(new Headers(create?.[1]?.headers).get('Authorization')).toBe('Bearer a-token');
  await user.click(screen.getByRole('button', { name: 'Editar' }));
  fireEvent.change(screen.getByLabelText(/Objetivo \(BOB\)/), { target: { value: '750.25' } });
  fireEvent.change(screen.getByLabelText(/Fecha objetivo/), { target: { value: '2027-05-15' } });
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  const edit = fetcher.mock.calls.find(([, options]) => options?.method === 'PATCH');
  expect(JSON.parse(String(edit?.[1]?.body))).toEqual({ name: 'Fondo futuro', target: '750.25', targetDate: '2027-05-15' });
});

it.each([['Aportar', 'Registrar aporte', 'contribution'], ['Retirar', 'Registrar retiro', 'withdrawal']])('submits %s with exact decimals and reloads confirmed progress', async (action, submit, type) => {
  const { store, fetcher } = installGoals([goal]); const user = userEvent.setup(); await enterGoals(user);
  const before = store.listCalls;
  await user.click(screen.getByRole('button', { name: action }));
  fireEvent.change(screen.getByLabelText(/Importe \(BOB\)/), { target: { value: '0.00' } });
  await user.click(screen.getByRole('button', { name: submit }));
  expect(screen.getByRole('alert')).toHaveTextContent('importe positivo');
  expect(fetcher.mock.calls.some(([url]) => String(url).endsWith('/entries'))).toBe(false);
  fireEvent.change(screen.getByLabelText(/Importe \(BOB\)/), { target: { value: '25.50' } });
  await user.click(screen.getByRole('button', { name: submit }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(await screen.findByText('Bs. 125,50')).toBeVisible();
  expect(store.listCalls).toBe(before + 1);
  const entry = fetcher.mock.calls.find(([url]) => String(url).endsWith(`/savings-goals/${goal.id}/entries`));
  expect(JSON.parse(String(entry?.[1]?.body))).toEqual({ type, amount: '25.50' });
});

it('keeps a failed withdrawal open without inventing success or refreshing the list', async () => {
  const { store } = installGoals([goal]); const user = userEvent.setup(); await enterGoals(user);
  store.mutationStatus = 409; const before = store.listCalls;
  await user.click(screen.getByRole('button', { name: 'Retirar' }));
  await user.type(screen.getByLabelText(/Importe \(BOB\)/), '999.00');
  await user.click(screen.getByRole('button', { name: 'Registrar retiro' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('no es compatible con el historial');
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(screen.getByText('Bs. 100,00')).toBeVisible();
  expect(store.listCalls).toBe(before);
});

it('archives and restores with PATCH while disabling entries for archived goals', async () => {
  const { fetcher } = installGoals([goal]); const user = userEvent.setup(); await enterGoals(user);
  await user.click(screen.getByRole('button', { name: 'Archivar' }));
  expect(await screen.findByText('Archivada')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Aportar' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Retirar' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Restaurar' }));
  expect(await screen.findByRole('button', { name: 'Aportar' })).toBeVisible();
  expect(fetcher.mock.calls.filter(([, options]) => options?.method === 'PATCH').map(([, options]) => JSON.parse(String(options?.body)))).toEqual([{ archived: true }, { archived: false }]);
  expect(fetcher.mock.calls.some(([, options]) => options?.method === 'DELETE')).toBe(false);
});

it('presents authoritative active, completed, overdue and archived values with capped progress', async () => {
  installGoals([
    { ...goal, name: 'Sin fecha', targetDate: null },
    { ...goal, id: '44444444-4444-4444-8444-444444444444', name: 'Excedida', state: 'completed', saved: '625.00', remaining: '0.00', progress: '125.00' },
    { ...goal, id: '55555555-5555-4555-8555-555555555555', name: 'Vencida sintética', state: 'overdue', targetDate: '2026-01-01' },
    { ...goal, id: '66666666-6666-4666-8666-666666666666', name: 'Archivada sintética', archived: true },
  ]);
  const user = userEvent.setup(); await enterGoals(user);
  expect(screen.getByText('Sin fecha objetivo')).toBeVisible();
  expect(screen.getByText('En progreso')).toBeVisible(); expect(screen.getByText('Completada')).toBeVisible(); expect(screen.getByText('Vencida')).toBeVisible(); expect(screen.getByText('Archivada')).toBeVisible();
  const progress = screen.getByRole('img', { name: 'Progreso de Excedida: 125,00 por ciento' });
  expect(progress).toBeVisible(); expect(progress.firstElementChild).toHaveStyle('--savings-progress: 100%');
  const card = screen.getByRole('heading', { name: 'Excedida' }).closest('article')!;
  expect(within(card).getByText('Bs. 625,00')).toBeVisible(); expect(within(card).getByText('Bs. 0,00')).toBeVisible();
});

it('distinguishes loading, a query error and the empty result after retry', async () => {
  const pending = deferred<Response>(); let calls = 0;
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => String(input).endsWith('/auth/login') ? sessionResponse('a-token') : ++calls === 1 ? pending.promise : jsonResponse([])));
  const user = userEvent.setup(); renderPage(); await user.click(screen.getByRole('button', { name: 'Entrar A' }));
  expect(screen.getByText('Cargando tus metas…')).toBeVisible(); expect(screen.queryByText('Aún no tienes metas de ahorro')).not.toBeInTheDocument();
  await act(async () => pending.resolve(jsonResponse({}, 500)));
  expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar tus metas.');
  expect(screen.queryByText('Aún no tienes metas de ahorro')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByText('Aún no tienes metas de ahorro')).toBeVisible();
});

it('expires the matching session after a 401 instead of rendering private goals', async () => {
  installGoals([goal]).store.listStatus = 401; const user = userEvent.setup(); renderPage();
  await user.click(screen.getByRole('button', { name: 'Entrar A' }));
  expect(await screen.findByText('Tu sesión terminó. Vuelve a ingresar para continuar.')).toBeVisible();
  expect(screen.getByLabelText('Sesión de prueba')).toHaveTextContent('Sin sesión');
  expect(screen.queryByText(goal.name)).not.toBeInTheDocument();
});

it('ignores a late list from A after B has loaded its own empty list', async () => {
  const pending = deferred<Response>();
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request, options?: RequestInit) => {
    if (String(input).endsWith('/auth/login')) return sessionResponse(JSON.parse(String(options?.body)).email.startsWith('a@') ? 'a-token' : 'b-token');
    return new Headers(options?.headers).get('Authorization') === 'Bearer a-token' ? pending.promise : jsonResponse([]);
  }));
  const user = userEvent.setup(); renderPage(); await user.click(screen.getByRole('button', { name: 'Entrar A' }));
  expect(screen.getByText('Cargando tus metas…')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Entrar B' }));
  await screen.findByText('Aún no tienes metas de ahorro');
  await act(async () => pending.resolve(jsonResponse([goal])));
  expect(screen.queryByText(goal.name)).not.toBeInTheDocument();
  expect(screen.getByText('Aún no tienes metas de ahorro')).toBeVisible();
});



it('keeps B’s goal form open when A’s pending mutation finishes', async () => {
  const pending = deferred<Response>(); const bGoal = { ...goal, name: 'Reserva propia B' }; let bReads = 0;
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request, options?: RequestInit) => {
    const url = String(input); const method = options?.method ?? 'GET';
    if (url.endsWith('/auth/login')) return sessionResponse(JSON.parse(String(options?.body)).email.startsWith('a@') ? 'a-token' : 'b-token');
    if (method === 'PATCH') return pending.promise;
    const isA = new Headers(options?.headers).get('Authorization') === 'Bearer a-token';
    if (!isA) bReads++;
    return jsonResponse(isA ? [goal] : [bGoal]);
  }));
  const user = userEvent.setup(); await enterGoals(user);
  await user.click(screen.getByRole('button', { name: 'Editar' }));
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await user.click(screen.getByRole('button', { name: 'Vencer sesión' }));
  await user.click(screen.getByRole('button', { name: 'Entrar B' }));
  await screen.findByRole('heading', { name: bGoal.name });
  await user.click(screen.getByRole('button', { name: 'Editar' }));
  await act(async () => pending.resolve(jsonResponse(goal)));
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(screen.getByLabelText('Nombre de la meta')).toHaveValue(bGoal.name);
  expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled();
  expect(bReads).toBe(1);
});
