import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { App } from '../../app/App';
import { deferred, jsonResponse, reportsFixture } from './test/fixtures';

function loginResponse() {
  return jsonResponse({ accessToken: 'r'.repeat(43), tokenType: 'Bearer', expiresAt: new Date(Date.now() + 3_600_000).toISOString() });
}

function responseFor(url: string) {
  const parsed = new URL(url);
  const report = reportsFixture();
  report.period.from = parsed.searchParams.get('from')!;
  report.period.to = parsed.searchParams.get('to')!;
  return jsonResponse(report);
}

beforeEach(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3100/api/v1');
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date('2026-03-10T16:00:00.000Z'));
  window.history.replaceState({}, '', '/reports');
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

it('shows loading then exact BOB report values and textual alternatives to both charts', async () => {
  const reportRequest = deferred<Response>();
  vi.stubGlobal('fetch', vi.fn((url: string) => url.endsWith('/auth/login') ? Promise.resolve(loginResponse()) : reportRequest.promise));
  render(<App />);
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  await user.type(screen.getByLabelText('Correo electrónico'), 'reports@fintrack.test');
  await user.type(screen.getByLabelText('Contraseña', { exact: true }), 'synthetic-password');
  await user.click(screen.getByRole('button', { name: 'Entrar a mi panel' }));
  expect(await screen.findByRole('status')).toHaveAttribute('aria-busy', 'true');

  await act(async () => { reportRequest.resolve(responseFor('http://synthetic/reports?from=2025-04-01&to=2026-03-10')); });
  expect(await screen.findByRole('heading', { name: 'Ingresos' })).toBeVisible();
  expect(screen.getByText('Bs. 123.456.789.012,34')).toBeVisible();
  expect(screen.getByRole('list', { name: 'Detalle textual de gastos por categoría' })).toBeVisible();
  expect(screen.getByRole('img', { name: /Gráfico de línea de la evolución/ })).toBeVisible();
  expect(screen.getByRole('table', { name: 'Valores exactos de la evolución del saldo' })).toBeVisible();
  expect(screen.getAllByText('Bs. 123.456.788.782,24')).toHaveLength(2);
});

it('keeps invalid date ranges local, announces the problem and makes no extra request', async () => {
  const fetcher = vi.fn((url: string) => url.endsWith('/auth/login') ? Promise.resolve(loginResponse()) : Promise.resolve(responseFor(url)));
  vi.stubGlobal('fetch', fetcher);
  render(<App />);
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  await user.type(screen.getByLabelText('Correo electrónico'), 'reports@fintrack.test');
  await user.type(screen.getByLabelText('Contraseña', { exact: true }), 'synthetic-password');
  await user.click(screen.getByRole('button', { name: 'Entrar a mi panel' }));
  await screen.findByRole('heading', { name: 'Ingresos' });
  const requestsBefore = fetcher.mock.calls.filter(([url]) => String(url).includes('/reports?')).length;

  await user.clear(screen.getByLabelText('Fecha inicial'));
  await user.type(screen.getByLabelText('Fecha inicial'), '2026-03-11');
  await user.click(screen.getByRole('button', { name: 'Actualizar' }));

  const error = await screen.findByRole('alert');
  expect(error).toHaveTextContent('La fecha inicial debe ser anterior o igual a la fecha final.');
  expect(screen.getByLabelText('Fecha inicial')).toHaveFocus();
  expect(fetcher.mock.calls.filter(([url]) => String(url).includes('/reports?'))).toHaveLength(requestsBefore);

  await user.clear(screen.getByLabelText('Fecha inicial'));
  await user.type(screen.getByLabelText('Fecha inicial'), '2024-03-01');
  await user.click(screen.getByRole('button', { name: 'Actualizar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('El período puede abarcar como máximo 24 meses calendario.');
  expect(fetcher.mock.calls.filter(([url]) => String(url).includes('/reports?'))).toHaveLength(requestsBefore);
});

it('shows recoverable service errors and allows retry without exposing the response body', async () => {
  let requests = 0;
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.endsWith('/auth/login')) return Promise.resolve(loginResponse());
    return ++requests === 1 ? Promise.resolve(jsonResponse({ error: { message: 'private synthetic error' } }, 503)) : Promise.resolve(responseFor(url));
  }));
  render(<App />);
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  await user.type(screen.getByLabelText('Correo electrónico'), 'reports@fintrack.test');
  await user.type(screen.getByLabelText('Contraseña', { exact: true }), 'synthetic-password');
  await user.click(screen.getByRole('button', { name: 'Entrar a mi panel' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar el informe');
  expect(screen.queryByText('private synthetic error')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Reintentar' }));
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Ingresos' })).toBeVisible());
  expect(requests).toBe(2);
});

it('distinguishes a valid empty report from loading or a transport error', async () => {
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.endsWith('/auth/login')) return Promise.resolve(loginResponse());
    const report = reportsFixture({ expenseDistribution: [], balanceEvolution: [] });
    const parsed = new URL(url);
    report.period.from = parsed.searchParams.get('from')!;
    report.period.to = parsed.searchParams.get('to')!;
    return Promise.resolve(jsonResponse(report));
  }));
  render(<App />);
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  await user.type(screen.getByLabelText('Correo electrónico'), 'reports@fintrack.test');
  await user.type(screen.getByLabelText('Contraseña', { exact: true }), 'synthetic-password');
  await user.click(screen.getByRole('button', { name: 'Entrar a mi panel' }));
  expect(await screen.findByText('No hay gastos por categoría en este período.')).toBeVisible();
  expect(screen.getByText('No hay saldos mensuales para mostrar en este período.')).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
