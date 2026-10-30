import { test, expect } from '@playwright/test';

// Synthetic HTTP fixtures only; these do not prove financial calculations.
const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
const category = { id: '22222222-2222-4222-8222-222222222222', name: 'Presupuesto sintético' };
const budget = { id: '11111111-1111-4111-8111-111111111111', categoryId: category.id, categoryName: category.name, limit: '100.00', spent: '100.01', remaining: '-0.01', progress: '100.01', state: 'exceeded' };

test('vaciar el mes conserva la vista y cancelar eliminación no envía DELETE', async ({ page }, testInfo) => {
  const periods: string[] = []; let deletes = 0;
  await page.route('**/api/v1/**', async route => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (request.url().endsWith('/auth/login')) return route.fulfill({ headers, json: { accessToken: 'synthetic-budget-token', tokenType: 'Bearer', expiresAt: new Date(Date.now() + 3_600_000).toISOString() } });
    expect(request.headers().authorization).toBe('Bearer synthetic-budget-token');
    if (request.url().endsWith('/categories')) return route.fulfill({ headers, json: [category] });
    if (request.method() === 'DELETE') { deletes++; return route.fulfill({ status: 204, headers }); }
    const month = new URL(request.url()).searchParams.get('month'); expect(month).toMatch(/^\d{4}-\d{2}$/); periods.push(month!);
    return route.fulfill({ headers, json: [budget] });
  });
  await page.goto('/budgets');
  await page.getByLabel('Correo electrónico').fill('budgets@fintrack.test');
  await page.getByLabel('Contraseña', { exact: true }).fill('synthetic-password');
  await page.getByRole('button', { name: 'Entrar a mi panel' }).click();
  await expect(page.getByRole('heading', { name: category.name })).toBeVisible();
  const month = await page.getByLabel('Período').inputValue();
  await page.getByLabel('Período').fill('');
  await expect(page.getByLabel('Período')).toHaveValue(month);
  await expect(page.getByRole('heading', { name: 'Presupuestos', exact: true })).toBeVisible();
  await expect(page.getByText('100,01 %', { exact: true })).toBeVisible();
  await expect(page.getByText('Superaste el límite de este presupuesto.')).toBeVisible();
  await page.getByRole('button', { name: `Eliminar presupuesto de ${category.name}` }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  expect(deletes).toBe(0); expect(periods.length).toBeGreaterThan(0); expect(periods.every(period => period === month)).toBe(true);
  if (testInfo.project.name === 'mobile') expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
