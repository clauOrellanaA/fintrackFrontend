import { test, expect, type Page, type Route } from '@playwright/test';
import { reportsSchema, type ReportsResponse } from '../src/features/reports/api/contract';

// Respuestas HTTP sintéticas controladas: no ejercitan una API real ni persistencia.
const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
function syntheticReport(route: Route): ReportsResponse {
  const url = new URL(route.request().url());
  const from = url.searchParams.get('from')!;
  const to = url.searchParams.get('to')!;
  return reportsSchema.parse({
    period: { from, to, timeZone: 'America/La_Paz', start: `${from}T04:00:00.000Z`, endExclusive: '2026-04-01T04:00:00.000Z' },
    currency: 'BOB', asOf: '2026-03-31T03:59:59.000Z',
    comparison: { income: '999999999999.99', expense: '200.25', net: '999999999799.74' },
    expenseDistribution: [{ categoryId: null, categoryName: 'Categoría sintética extensa de informes', amount: '200.25', percentage: '100.00' }],
    balanceEvolution: [
      { month: '2026-02', amount: '99.50', cutoff: '2026-03-01T03:59:59.000Z' },
      { month: '2026-03', amount: '999999999799.74', cutoff: '2026-03-31T03:59:59.000Z' },
    ],
  });
}
async function controlledApi(page: Page, seenPeriods: string[]) {
  await page.route('**/api/v1/**', async route => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (request.url().endsWith('/auth/login')) {
      expect(request.postDataJSON()).toEqual({ email: 'reports@fintrack.test', password: 'e2e-synthetic-password' });
      return route.fulfill({ headers, json: { accessToken: 'r'.repeat(43), tokenType: 'Bearer', expiresAt: new Date(Date.now() + 3_600_000).toISOString() } });
    }
    expect(request.method()).toBe('GET');
    expect(request.headers().authorization).toBe(`Bearer ${'r'.repeat(43)}`);
    expect(request.url()).toContain('/reports?');
    expect(request.headers().cookie).toBeFalsy();
    seenPeriods.push(new URL(request.url()).search);
    return route.fulfill({ headers, json: syntheticReport(route) });
  });
}
async function signIn(page: Page) {
  await page.getByLabel('Correo electrónico').fill('reports@fintrack.test');
  await page.getByLabel('Contraseña', { exact: true }).fill('e2e-synthetic-password');
  await page.getByRole('button', { name: 'Entrar a mi panel' }).click();
}

test('consulta informes con filtro de fechas y expone resultados BOB y alternativas accesibles', async ({ page }, testInfo) => {
  const periods: string[] = [];
  await controlledApi(page, periods);
  await page.goto('/reports');
  await signIn(page);

  await expect(page.getByRole('heading', { name: 'Ingresos' })).toBeVisible();
  await expect(page.getByText('Bs. 999.999.999.999,99', { exact: true })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Detalle textual de gastos por categoría' })).toContainText('Categoría sintética extensa de informes');
  await expect(page.getByRole('img', { name: /Gráfico de línea de la evolución del saldo mensual/ })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Valores exactos de la evolución del saldo' })).toContainText('Bs. 999.999.999.799,74');

  await page.getByLabel('Fecha inicial').fill('2026-02-01');
  await page.getByLabel('Fecha final').fill('2026-03-31');
  await page.getByRole('button', { name: 'Actualizar' }).click();
  await expect.poll(() => periods.some(period => period.includes('from=2026-02-01') && period.includes('to=2026-03-31'))).toBe(true);
  await expect(page.getByRole('alert')).toHaveCount(0);

  if (testInfo.project.name === 'mobile') {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('table', { name: 'Valores exactos de la evolución del saldo' })).toBeVisible();
  }
});
