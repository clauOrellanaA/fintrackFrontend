import { test, expect, type Page } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import { dashboardSchema } from '../src/features/dashboard/api/contract';

const contract = JSON.parse(readFileSync(new URL('../docs/contracts/dashboard.v1.json', import.meta.url), 'utf8')) as typeof import('../docs/contracts/dashboard.v1.json');
const fixture = dashboardSchema.parse(contract.paths['/dashboard'].get.responses['200'].content['application/json'].examples.be06.value);
type Mode = 'success' | 'empty' | 'failure' | 'unauthenticated';

async function controlledApi(page: Page, currentMode: () => Mode) {
  await page.route('**/api/v1/**', async route => {
    const request = route.request();
    const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS' };
    if (request.method() === 'OPTIONS' || request.method() === 'DELETE') { await route.fulfill({ status: 204, headers }); return; }
    if (request.url().endsWith('/auth/login')) {
      expect(request.postDataJSON()).toEqual({ email: 'alice@fintrack.test', password: 'e2e-fixture-password' });
      await route.fulfill({ status: 200, headers, json: { accessToken: 'a'.repeat(43), tokenType: 'Bearer', expiresAt: new Date(Date.now() + 3600000).toISOString() } }); return;
    }
    expect(request.headers().authorization).toBe(`Bearer ${'a'.repeat(43)}`);
    const mode = currentMode();
    if (mode === 'failure' || mode === 'unauthenticated') {
      await route.fulfill({ status: mode === 'failure' ? 503 : 401, headers, json: { error: { code: 'TEST_ERROR', message: 'test-only private message' } } }); return;
    }
    const body = structuredClone(fixture);
    body.period.month = new URL(request.url()).searchParams.get('month')!;
    if (mode === 'empty') {
      body.sections.balance = { status: 'ready', data: { amount: '0.00', cutoff: body.asOf } };
      body.sections.monthlySummary = { status: 'ready', data: { income: '0.00', expense: '0.00' } };
      body.sections.expenseDistribution = { status: 'ready', data: [] };
      body.sections.budgets = { status: 'ready', data: [] };
      body.sections.savingsGoals = { status: 'ready', data: [] };
    }
    await route.fulfill({ status: 200, headers, json: body });
  });
}
async function signIn(page: Page) {
  await page.getByLabel('Correo electrónico').fill('alice@fintrack.test');
  await page.getByLabel('Contraseña', { exact: true }).fill('e2e-fixture-password');
  await page.getByRole('button', { name: 'Entrar a mi panel' }).click();
}

test('reference-inspired shell, period selection, private logout and responsive viewport', async ({ page }, info) => {
  await controlledApi(page, () => 'success');
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Tu panel te espera' })).toBeVisible();
  mkdirSync('docs/previews', { recursive: true });
  await page.screenshot({ path: `docs/previews/fe-00-access-${info.project.name}.png`, fullPage: true });
  await signIn(page);
  await expect(page.getByText('Tu información está conectada')).toBeVisible();
  await page.getByLabel('Mes consultado').fill('2026-02');
  await expect(page.getByRole('status').getByText(/febrero de 2026/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Actualizar panel' })).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (info.project.name === 'mobile') {
    await page.getByLabel('Abrir navegación').click();
    await expect(page.getByRole('link', { name: 'Panel principal', exact: true })).toBeVisible();
    await page.getByLabel('Abrir navegación').click();
  }
  await page.screenshot({ path: `docs/previews/fe-00-panel-${info.project.name}.png`, fullPage: true });
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Tu panel te espera' })).toBeVisible();
  await expect(page.getByText('Tu información está conectada')).toHaveCount(0);
});
test('retryable failure is different from a genuine empty panel', async ({ page }) => {
  let mode: Mode = 'failure';
  await controlledApi(page, () => mode);
  await page.goto('/dashboard'); await signIn(page);
  await expect(page.getByRole('heading', { name: 'No pudimos abrir tu panel' })).toBeVisible();
  await expect(page.getByText('Tu historia financiera empieza aquí')).toHaveCount(0);
  await expect(page.getByText('test-only private message')).toHaveCount(0);
  mode = 'empty';
  await page.getByRole('button', { name: 'Volver a intentar' }).click();
  await expect(page.getByText('Tu historia financiera empieza aquí')).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});
test('invalid server session returns to access screen without stale data', async ({ page }) => {
  await controlledApi(page, () => 'unauthenticated');
  await page.goto('/dashboard'); await signIn(page);
  await expect(page.getByText('Tu sesión terminó. Vuelve a ingresar para continuar.')).toBeVisible();
  await expect(page.getByText('Tu información está conectada')).toHaveCount(0);
});
