import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { App } from '../../app/App';
import { jsonResponse, sessionResponse } from '../../test/fixtures';

const category = { id: '22222222-2222-4222-8222-222222222222', name: 'Hogar' };
const createBudget = (limit: string) => ({
  id: '11111111-1111-4111-8111-111111111111',
  categoryId: category.id,
  categoryName: category.name,
  limit,
  spent: '80.00',
  remaining: `${(Number(limit) - 80).toFixed(2)}`,
  progress: `${((80 / Number(limit)) * 100).toFixed(2)}`,
  state: Number(limit) === 100 ? 'warning' : 'normal',
});

it('creates, edits and deletes a monthly budget through the authenticated dashboard UI', async () => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3100/api/v1');
  window.history.replaceState({}, '', '/budgets');
  let budget: ReturnType<typeof createBudget> | null = null;
  const fetcher = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    if (url.endsWith('/auth/login')) return sessionResponse();
    if (url.endsWith('/categories')) return jsonResponse([category]);
    if (url.includes('/budgets?')) return jsonResponse(budget ? [budget] : []);
    if (url.endsWith('/budgets') && method === 'POST') {
      budget = createBudget('100.00');
      return jsonResponse(budget, 201);
    }
    if (url.endsWith(`/budgets/${budget?.id}`) && method === 'PATCH') {
      budget = createBudget(JSON.parse(String(init?.body)).limit);
      return jsonResponse(budget);
    }
    if (url.endsWith(`/budgets/${budget?.id}`) && method === 'DELETE') {
      budget = null;
      return new Response(null, { status: 204 });
    }
    throw new Error(`Unexpected request: ${method} ${url}`);
  });
  vi.stubGlobal('fetch', fetcher);
  const user = userEvent.setup();
  render(<App />);

  await user.type(await screen.findByLabelText('Correo electrónico'), 'alice@fintrack.test');
  await user.type(screen.getByLabelText('Contraseña', { exact: true }), 'local-password');
  await user.click(screen.getByRole('button', { name: 'Entrar a mi panel' }));
  expect(await screen.findByRole('heading', { name: 'Presupuestos' })).toBeVisible();
  expect(await screen.findByText(/Aún no hay presupuestos/)).toBeVisible();

  await user.click(screen.getByRole('button', { name: 'Crear presupuesto' }));
  await user.selectOptions(screen.getByLabelText('Categoría'), category.id);
  await user.clear(screen.getByLabelText('Límite mensual', { exact: false }));
  await user.type(screen.getByLabelText('Límite mensual', { exact: false }), '100.00');
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Crear presupuesto' }));
  expect(await screen.findByRole('heading', { name: 'Hogar' })).toBeVisible();
  expect(await screen.findByText('Has usado al menos el 80 % de este límite.')).toBeVisible();

  await user.click(screen.getByRole('button', { name: 'Editar' }));
  await user.clear(screen.getByLabelText('Límite mensual', { exact: false }));
  await user.type(screen.getByLabelText('Límite mensual', { exact: false }), '200.00');
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(screen.getByText('Bs. 200,00')).toBeVisible());

  await user.click(screen.getByRole('button', { name: 'Eliminar presupuesto de Hogar' }));
  await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Eliminar presupuesto' }));
  expect(await screen.findByText(/Aún no hay presupuestos/)).toBeVisible();
  expect(fetcher.mock.calls.some(([, options]) => options?.method === 'DELETE')).toBe(true);
});
