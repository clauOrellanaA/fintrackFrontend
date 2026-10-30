import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { SessionProvider, useSession } from '../../shared/session/SessionProvider';
import { deferred, jsonResponse, sessionResponse } from '../../test/fixtures';
import type { Category, Transaction } from './api/contract';
import { TransactionsPage } from './TransactionsPage';

// Synthetic fixtures; no real accounts, persistence, or service calls.
const id = '22222222-2222-4222-8222-222222222222';
const categoryId = '11111111-1111-4111-8111-111111111111';
const initial: Transaction = { id, type: 'expense', amount: '12.50', currency: 'BOB', categoryId: null, categoryName: null, occurredAt: '2026-10-30T16:00:00.000Z', description: 'Almuerzo sintético', status: 'posted' };
function Controls() { const { signIn } = useSession(); return <button onClick={() => void signIn('synthetic@fintrack.test', 'synthetic-password')}>Acceso sintético</button>; }
function server({ pages = 1, failDelete = false, failCreate = false }: { pages?: number; failDelete?: boolean; failCreate?: boolean } = {}) {
  let items: Transaction[] = [initial];
  let categories: Category[] = [];
  let deletingFailed = false;
  return vi.fn(async (input: string | URL | Request, options: RequestInit = {}) => {
    const url = new URL(String(input));
    const body = options?.body ? JSON.parse(String(options?.body)) : {};
    if (url.pathname.endsWith('/auth/login')) return sessionResponse();
    if (url.pathname.endsWith('/categories') && options?.method === 'POST') { const created = { id: categoryId, name: body.name }; categories = [created]; return jsonResponse(created, 201); }
    if (url.pathname.endsWith(`/categories/${categoryId}`)) {
      if (options?.method === 'DELETE') return jsonResponse({}, 409);
      categories = [{ id: categoryId, name: body.name }]; return jsonResponse(categories[0]);
    }
    if (url.pathname.endsWith('/categories')) return jsonResponse(categories);
    if (url.pathname.endsWith('/transactions') && options?.method === 'POST') {
      if (failCreate) return jsonResponse({}, 503);
      const created = { ...initial, ...body, categoryName: body.categoryId ? 'Categoría sintética' : null }; items = [created]; return jsonResponse(created, 201);
    }
    if (url.pathname.endsWith(`/transactions/${id}`)) {
      if (options?.method === 'DELETE') {
        if (failDelete && !deletingFailed) { deletingFailed = true; return jsonResponse({}, 503); }
        items = [{ ...items[0], status: 'void' }]; return new Response(null, { status: 204 });
      }
      items = [{ ...items[0], ...body }]; return jsonResponse(items[0]);
    }
    return jsonResponse({ items, page: Number(url.searchParams.get('page') ?? 1), pageSize: 10, totalItems: pages * 10, totalPages: pages });
  });
}
async function enter(fetcher: ReturnType<typeof server>) {
  vi.stubGlobal('fetch', fetcher);
  render(<MemoryRouter><SessionProvider><Controls /><TransactionsPage /></SessionProvider></MemoryRouter>);
  const user = userEvent.setup();
  await user.click(screen.getByText('Acceso sintético'));
  await screen.findByText(initial.description!);
  return user;
}
const queries = (fetcher: ReturnType<typeof server>) => fetcher.mock.calls.filter(([url]) => String(url).includes('/transactions?'));
const mutations = (fetcher: ReturnType<typeof server>) => fetcher.mock.calls.filter(([url, options]) => String(url).includes('/transactions') && ['POST', 'PATCH', 'DELETE'].includes(options?.method ?? 'GET'));
beforeEach(() => vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3100/api/v1'));

it('validates exact positive money locally and creates then edits with optional trimmed description and Bolivia instant', async () => {
  const fetcher = server();
  const user = await enter(fetcher);
  await user.click(screen.getByRole('button', { name: 'Agregar movimiento' }));
  let dialog = screen.getByRole('dialog');
  for (const amount of ['0.00', '12', '12.3', '-1.00']) {
    fireEvent.change(within(dialog).getByLabelText(/Importe/), { target: { value: amount } });
    await user.click(within(dialog).getByRole('button', { name: 'Agregar movimiento' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('importe positivo con dos decimales');
  }
  fireEvent.change(within(dialog).getByLabelText(/Importe/), { target: { value: '999999999999.99' } });
  fireEvent.change(within(dialog).getByLabelText('Fecha y hora'), { target: { value: '' } });
  await user.click(within(dialog).getByRole('button', { name: 'Agregar movimiento' }));
  expect(within(dialog).getByRole('alert')).toHaveTextContent('Selecciona la fecha y hora');
  expect(mutations(fetcher)).toHaveLength(0);
  fireEvent.change(within(dialog).getByLabelText('Fecha y hora'), { target: { value: '2026-10-30T23:59' } });
  await user.type(within(dialog).getByLabelText(/Descripción/), '  Cena sintética  ');
  await user.click(within(dialog).getByRole('button', { name: 'Agregar movimiento' }));
  await screen.findByText('Cena sintética');
  expect(JSON.parse(String(mutations(fetcher)[0][1]?.body))).toEqual({ type: 'expense', amount: '999999999999.99', categoryId: null, occurredAt: '2026-10-31T03:59:00.000Z', description: 'Cena sintética' });
  await user.click(screen.getByRole('button', { name: 'Editar Cena sintética' }));
  dialog = screen.getByRole('dialog');
  await user.clear(within(dialog).getByLabelText(/Descripción/));
  fireEvent.change(within(dialog).getByLabelText(/Importe/), { target: { value: '25.75' } });
  await user.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(mutations(fetcher)[1][1]?.method).toBe('PATCH');
  expect(JSON.parse(String(mutations(fetcher)[1][1]?.body))).toMatchObject({ amount: '25.75', description: null, categoryId: null });
});

it('keeps failed creates editable and does not show a successful movement', async () => {
  const fetcher = server({ failCreate: true });
  const user = await enter(fetcher);
  await user.click(screen.getByRole('button', { name: 'Agregar movimiento' }));
  const dialog = screen.getByRole('dialog');
  await user.type(within(dialog).getByLabelText(/Importe/), '25.00');
  await user.click(within(dialog).getByRole('button', { name: 'Agregar movimiento' }));
  expect(await within(dialog).findByRole('alert')).toHaveTextContent('No pudimos completar');
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(queries(fetcher)).toHaveLength(1);
  await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('supports cancel, failure and confirmed void without destructive UI actions on void records', async () => {
  const fetcher = server({ failDelete: true });
  const user = await enter(fetcher);
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
  await user.click(screen.getByRole('button', { name: `Anular ${initial.description}` }));
  expect(mutations(fetcher)).toHaveLength(0);
  confirm.mockReturnValue(true);
  await user.click(screen.getByRole('button', { name: `Anular ${initial.description}` }));
  expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos completar');
  expect(screen.queryByText('Anulado', { exact: true })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: `Anular ${initial.description}` }));
  await screen.findByText('Anulado', { exact: true });
  expect(screen.queryByRole('button', { name: `Anular ${initial.description}` })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: `Editar ${initial.description}` })).not.toBeInTheDocument();
  confirm.mockRestore();
});

it('applies one full Bolivia day, type/status/search and resets ten-item pagination when filters change', async () => {
  const fetcher = server({ pages: 3 });
  const user = await enter(fetcher);
  await user.click(screen.getByRole('button', { name: 'Siguiente' }));
  await screen.findByText('Página 2 de 3');
  fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-10-30' } });
  fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-10-30' } });
  await user.selectOptions(screen.getByLabelText('Tipo', { exact: true }), 'expense');
  await user.selectOptions(screen.getByLabelText('Estado'), 'all');
  await user.type(screen.getByLabelText('Descripción o categoría'), '  Cena  ');
  await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }));
  await screen.findByText('Página 1 de 3');
  const query = new URL(String(queries(fetcher).at(-1)![0])).searchParams;
  expect(Object.fromEntries(query)).toEqual({ status: 'all', page: '1', pageSize: '10', from: '2026-10-30T04:00:00.000Z', to: '2026-10-31T04:00:00.000Z', type: 'expense', q: 'Cena' });
  const before = queries(fetcher).length;
  fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-10-31' } });
  await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }));
  expect(screen.getByRole('alert')).toHaveTextContent('La fecha inicial no puede ser posterior');
  expect(queries(fetcher)).toHaveLength(before);
});

it('creates and renames categories, and preserves the deletion conflict and history explanation', async () => {
  const fetcher = server();
  const user = await enter(fetcher);
  await user.click(screen.getByText('Administrar categorías'));
  await user.type(screen.getByLabelText('Nombre de categoría'), '  Comida  ');
  await user.click(screen.getByRole('button', { name: 'Agregar' }));
  await screen.findByRole('button', { name: 'Editar Comida' });
  await user.click(screen.getByRole('button', { name: 'Editar Comida' }));
  await user.clear(screen.getByLabelText('Nuevo nombre para Comida'));
  await user.type(screen.getByLabelText('Nuevo nombre para Comida'), '  Alimentación  ');
  await user.click(screen.getByRole('button', { name: 'Guardar nombre' }));
  await screen.findByRole('button', { name: 'Eliminar Alimentación' });
  const requests = fetcher.mock.calls.filter(([url, options]) => String(url).includes('/categories') && ['POST', 'PATCH'].includes(options?.method ?? 'GET'));
  expect(requests.map(([, options]) => JSON.parse(String(options?.body)))).toEqual([{ name: 'Comida' }, { name: 'Alimentación' }]);
  await user.click(screen.getByRole('button', { name: 'Eliminar Alimentación' }));
  const dialog = screen.getByRole('alertdialog');
  expect(dialog).toHaveTextContent('Los movimientos asociados se conservarán y quedarán sin categoría.');
  await user.click(within(dialog).getByRole('button', { name: 'Eliminar categoría' }));
  expect(await within(dialog).findByRole('alert')).toHaveTextContent('vinculada a un presupuesto');
  expect(screen.getByRole('alertdialog')).toBeVisible();
  await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Eliminar Alimentación' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Agregar movimiento' }));
  const movement = screen.getByRole('dialog');
  await user.type(within(movement).getByLabelText(/Importe/), '25.00');
  await user.selectOptions(within(movement).getByLabelText('Categoría'), categoryId);
  await user.click(within(movement).getByRole('button', { name: 'Agregar movimiento' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(JSON.parse(String(mutations(fetcher).at(-1)![1]?.body))).toMatchObject({ categoryId });
});

it('announces loading, offers recovery after failure and distinguishes the valid empty result', async () => {
  const pending = deferred<Response>();
  let attempts = 0;
  vi.stubGlobal('fetch', vi.fn((input: string | URL | Request) => {
    const url = String(input);
    if (url.endsWith('/auth/login')) return Promise.resolve(sessionResponse());
    if (url.endsWith('/categories')) return Promise.resolve(jsonResponse([]));
    return ++attempts === 1 ? pending.promise : Promise.resolve(jsonResponse({ items: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 0 }));
  }));
  render(<MemoryRouter><SessionProvider><Controls /><TransactionsPage /></SessionProvider></MemoryRouter>);
  const user = userEvent.setup();
  await user.click(screen.getByText('Acceso sintético'));
  expect(await screen.findByText('Cargando movimientos…')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /No hay resultados|Todavía no hay movimientos/ })).not.toBeInTheDocument();
  await act(async () => pending.resolve(jsonResponse({}, 503)));
  expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar tus movimientos');
  expect(screen.queryByRole('heading', { name: /No hay resultados|Todavía no hay movimientos/ })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Volver a intentar' }));
  expect(await screen.findByRole('heading', { name: /No hay resultados|Todavía no hay movimientos/ })).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.queryByText('Cargando movimientos…')).not.toBeInTheDocument();
  expect(attempts).toBe(2);
});
