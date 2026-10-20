import { test, expect } from '@playwright/test';
import { dashboardSchema } from '../../src/features/dashboard/api/contract';
import { formatBobMoney } from '../../src/shared/formatters/money';

// Opt-in: cuentas sintéticas provistas por el operador en una API de pruebas aislada.
// Sin rutas simuladas, escrituras financieras, seeds ni acceso directo a persistencia.
test('two real accounts render their own API response and clear data on logout', async ({ page }) => {
  const month = process.env.FINTRACK_TEST_MONTH!;
  await page.goto('/dashboard');
  for (const account of ['A', 'B']) {
    await page.getByLabel('Correo electrónico').fill(process.env[`FINTRACK_TEST_EMAIL_${account}`]!);
    await page.getByLabel('Contraseña', { exact: true }).fill(process.env[`FINTRACK_TEST_PASSWORD_${account}`]!);
    const responsePromise = page.waitForResponse(response => response.request().method() === 'GET' && new URL(response.url()).pathname.endsWith('/dashboard') && response.status() === 200);
    await page.getByRole('button', { name: 'Entrar a mi panel' }).click();
    await responsePromise;
    await expect(page.getByText('Tu información está conectada')).toBeVisible();
    const selected = page.getByLabel('Mes consultado');
    const targetResponse = page.waitForResponse(response => response.request().method() === 'GET' && new URL(response.url()).pathname.endsWith('/dashboard') && new URL(response.url()).searchParams.get('month') === month);
    if (await selected.inputValue() === month) await page.getByRole('button', { name: 'Actualizar panel' }).click();
    else await selected.fill(month);
    const response = await targetResponse;
    expect(response.status(), 'dashboard real debe responder 200').toBe(200);
    // No imprimir cuerpos, tokens ni credenciales en mensajes de error.
    const parsed = dashboardSchema.safeParse(await response.json());
    expect(parsed.success, 'respuesta real cumple dashboard.v1').toBe(true);
    if (!parsed.success) return;
    const data = parsed.data;
    expect(data.period.month === month, 'API devuelve mes solicitado').toBe(true);
    await expect(page.getByText('Tu información está conectada')).toBeVisible();
    const s = data.sections;
    expect(Object.values(s).every(section => section.status === 'ready'), 'dataset de cierre requiere todas las secciones ready').toBe(true);
    if (s.balance.status !== 'ready' || s.monthlySummary.status !== 'ready' || s.expenseDistribution.status !== 'ready' || s.budgets.status !== 'ready' || s.savingsGoals.status !== 'ready') return;
    const contains = async (selector: ReturnType<typeof page.locator>, value: string) => {
      await expect.poll(async () => (await selector.textContent())?.includes(value), { message: 'valor contractual renderizado en su tarjeta o fila' }).toBe(true);
    };
    await contains(page.locator('.balance-card'), formatBobMoney(s.balance.data.amount));
    await contains(page.locator('.summary-card--income'), formatBobMoney(s.monthlySummary.data.income));
    await contains(page.locator('.summary-card--expense'), formatBobMoney(s.monthlySummary.data.expense));
    const expenses = page.locator('.expense-distribution__list > li');
    await expect(expenses).toHaveCount(s.expenseDistribution.data.length);
    for (const [index, item] of s.expenseDistribution.data.entries()) {
      const row = expenses.nth(index);
      await contains(row, item.categoryName);
      await contains(row, formatBobMoney(item.amount));
      await contains(row, `${item.percentage.replace('.', ',')} %`);
    }
    const budgets = page.locator('.budget-indicators__list > li');
    await expect(budgets).toHaveCount(s.budgets.data.length);
    for (const [index, item] of s.budgets.data.entries()) {
      const row = budgets.nth(index);
      await contains(row.locator('h3'), item.categoryName);
      const values = row.locator('.financial-amount');
      for (const [position, amount] of [item.spent, item.limit, item.remaining].entries()) await contains(values.nth(position), formatBobMoney(amount));
      const state = { normal: 'En rango', warning: 'Atención', exceeded: 'Excedido' }[item.state];
      await contains(row.locator('.budget-indicators__state'), state);
      expect(await row.getByRole('img').getAttribute('aria-label').then(label => label === `Progreso de ${item.categoryName}: ${state}, ${item.progress.replace('.', ',')} %`), 'alternativa de presupuesto corresponde a la fila').toBe(true);
    }
    const goals = page.locator('.savings-goals__list > li');
    await expect(goals).toHaveCount(s.savingsGoals.data.length);
    for (const [index, item] of s.savingsGoals.data.entries()) {
      const row = goals.nth(index);
      await contains(row.locator('h3'), item.name);
      const values = row.locator('.financial-amount');
      for (const [position, amount] of [item.saved, item.target, item.remaining].entries()) await contains(values.nth(position), formatBobMoney(amount));
      const state = { active: 'En progreso', completed: 'Completada', overdue: 'Vencida' }[item.state];
      await contains(row.locator('.savings-goals__state'), state);
      expect(await row.getByRole('img').getAttribute('aria-label').then(label => label === `Progreso de ${item.name}: ${state}, ${item.progress.replace('.', ',')} %`), 'alternativa de meta corresponde a la fila').toBe(true);
    }
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page.getByRole('heading', { name: 'Tu panel te espera' })).toBeVisible();
    await expect(page.getByText('Tu información está conectada')).toHaveCount(0);
  }
});
