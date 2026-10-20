import { test, expect, type Page, type Route } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { dashboardSchema, type Dashboard } from '../src/features/dashboard/api/contract';

// Datos sintéticos del ejemplo contractual; no representan una cuenta real.
const contract = JSON.parse(readFileSync(new URL('../docs/contracts/dashboard.v1.json', import.meta.url), 'utf8'));
const synthetic = (): Dashboard => dashboardSchema.parse(contract.paths['/dashboard'].get.responses['200'].content['application/json'].examples.be06.value);
const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
async function setup(page: Page, dashboard: (route: Route) => Promise<void>) {
  await page.route('**/api/v1/**', async route => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (route.request().url().endsWith('/auth/login')) return route.fulfill({ headers, json: { accessToken: 'synthetic-token', tokenType: 'Bearer', expiresAt: new Date(Date.now() + 3600000).toISOString() } });
    await dashboard(route);
  });
  await page.goto('/dashboard');
}
async function login(page: Page) {
  await page.getByLabel('Correo electrónico').fill('synthetic@fintrack.test');
  await page.getByLabel('Contraseña', { exact: true }).fill('synthetic-password');
  await page.getByRole('button', { name: 'Entrar a mi panel' }).press('Enter');
}
async function respond(route: Route, body = synthetic()) {
  body.period.month = new URL(route.request().url()).searchParams.get('month')!;
  await route.fulfill({ headers, json: body });
}

test('retained request exposes loading and disables refresh until response', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await setup(page, async route => { await gate; await respond(route); });
  await login(page);
  await expect(page.getByRole('status')).toContainText('Cargando tu panel');
  await expect(page.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByRole('button', { name: 'Actualizar panel' })).toBeDisabled();
  await expect(page.getByText('Tu historia financiera empieza aquí')).toHaveCount(0);
  release();
  await expect(page.getByText('Tu información está conectada')).toBeVisible();
});

test('late previous-month response cannot replace the selected month', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });

  await setup(page, async route => {
    if (new URL(route.request().url()).searchParams.get('month') !== '2026-02') await gate;
    await respond(route);
  });
  await login(page);
  await expect(page.getByRole('status')).toContainText('Cargando');
  await page.getByLabel('Mes consultado').fill('2026-02');
  await expect(page.getByRole('status')).toContainText('febrero de 2026');
  release();
  await page.getByRole('button', { name: 'Actualizar panel' }).press('Enter');
  await expect(page.getByRole('status')).toContainText('febrero de 2026');
  await expect(page.getByLabel('Mes consultado')).toHaveValue('2026-02');
});

test('invalid monetary data is an error rather than a zero or empty dashboard', async ({ page }) => {
  await setup(page, async route => {
    const body = synthetic();
    body.sections.balance = { status: 'ready', data: { amount: 'NaN', cutoff: body.asOf } };
    await respond(route, body);
  });
  await login(page);
  await expect(page.getByRole('alert')).toContainText('No pudimos abrir tu panel');
  await expect(page.getByText('Bs. 0,00', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Tu historia financiera empieza aquí')).toHaveCount(0);
});

test('keyboard skip link, login and refresh remain operable', async ({ page }) => {
  let requests = 0;
  await setup(page, async route => { requests++; await respond(route); });
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await login(page);
  await expect(page.getByText('Tu información está conectada')).toBeVisible();
  await expect(page.getByRole('main')).toBeFocused();
  const before = requests;
  await page.getByRole('button', { name: 'Actualizar panel' }).focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => requests).toBe(before + 1);
  await expect(page.getByRole('button', { name: 'Actualizar panel' })).toBeEnabled();
});

test('text alternatives preserve exact maximum amounts and long names at 320px', async ({ page }) => {
  const body = synthetic();
  const name = 'Categoría sintética muy larga para comprobar distribución y presupuestos';
  const unbroken = 'MetaSintética' + 'SinEspacios'.repeat(15);
  body.sections.balance = { status: 'ready', data: { amount: '999999999999.99', cutoff: body.asOf } };
  if (body.sections.expenseDistribution.status === 'ready') body.sections.expenseDistribution.data[0] = { ...body.sections.expenseDistribution.data[0], categoryName: name, amount: '999999999999.99' };
  if (body.sections.budgets.status === 'ready') body.sections.budgets.data[0].categoryName = name;
  if (body.sections.savingsGoals.status === 'ready') body.sections.savingsGoals.data[0].name = unbroken;
  await page.setViewportSize({ width: 320, height: 844 });
  await setup(page, route => respond(route, structuredClone(body)));
  await login(page);
  await expect(page.getByText('Bs. 999.999.999.999,99', { exact: true }).first()).toBeVisible();
  const distribution = page.getByRole('list', { name: /Detalle textual de gastos/ });
  await expect(distribution).toContainText(name);
  await expect(distribution).toContainText('del gasto mensual');
  await expect(page.getByRole('img', { name: `Progreso de ${name}:`, exact: false })).toBeVisible();
  await expect(page.getByRole('img', { name: `Progreso de ${unbroken}:`, exact: false })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const element of await page.locator('.financial-amount, .expense-distribution__name, .savings-goals__row h3').all()) {
    expect(await element.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    const box = await element.boundingBox();
    expect(box && box.x >= 0 && box.x + box.width <= 321).toBe(true);
  }
});
