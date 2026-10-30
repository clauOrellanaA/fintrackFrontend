import { test, expect } from '@playwright/test';
import { savingsGoalSchema, type SavingsGoal } from '../src/features/savings-goals/api/contract';

// Synthetic HTTP fixtures only; no service or database is exercised.
const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
const syntheticGoal: SavingsGoal = { id: '11111111-1111-4111-8111-111111111111', name: 'Meta sintética', target: '100.00', saved: '0.00', remaining: '100.00', progress: '0.00', state: 'active', targetDate: null, archived: false, createdAt: '2026-10-30T12:00:00-04:00', currency: 'BOB' };

test('crea una meta y conserva el archivo/restauración con importes exactos', async ({ page }, testInfo) => {
  let goals: SavingsGoal[] = []; const updates: unknown[] = [];
  await page.route('**/api/v1/**', async route => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (request.url().endsWith('/auth/login')) return route.fulfill({ headers, json: { accessToken: 'synthetic-goals-token', tokenType: 'Bearer', expiresAt: new Date(Date.now() + 3_600_000).toISOString() } });
    expect(request.headers().authorization).toBe('Bearer synthetic-goals-token');
    if (request.method() === 'GET') return route.fulfill({ headers, json: goals });
    if (request.method() === 'POST') {
      expect(request.postDataJSON()).toEqual({ name: 'Vacaciones sintéticas', target: '1200.50', targetDate: null });
      goals = [savingsGoalSchema.parse({ ...syntheticGoal, ...request.postDataJSON(), remaining: '1200.50' })];
      return route.fulfill({ status: 201, headers, json: goals[0] });
    }
    expect(request.method()).toBe('PATCH'); updates.push(request.postDataJSON());
    goals = [savingsGoalSchema.parse({ ...goals[0], ...request.postDataJSON() })];
    return route.fulfill({ headers, json: goals[0] });
  });
  await page.goto('/savings-goals');
  await page.getByLabel('Correo electrónico').fill('goals@fintrack.test');
  await page.getByLabel('Contraseña', { exact: true }).fill('synthetic-password');
  await page.getByRole('button', { name: 'Entrar a mi panel' }).click();
  await expect(page.getByText('Aún no tienes metas de ahorro')).toBeVisible();
  await page.getByRole('button', { name: 'Nueva meta' }).click();
  await expect(page.getByLabel('Nombre de la meta')).toBeFocused();
  await page.getByLabel('Nombre de la meta').fill('  Vacaciones sintéticas  ');
  await page.getByLabel('Objetivo (BOB)', { exact: false }).fill('1200.50');
  await page.getByRole('dialog').getByRole('button', { name: 'Crear meta' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Vacaciones sintéticas' })).toBeVisible();
  await expect(page.getByText('Bs. 1.200,50', { exact: true })).toHaveCount(2);
  await page.getByRole('button', { name: 'Archivar' }).click();
  await expect(page.getByText('Archivada', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Aportar' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Restaurar' }).click();
  await expect(page.getByRole('button', { name: 'Aportar' })).toBeVisible();
  expect(updates).toEqual([{ archived: true }, { archived: false }]);
  if (testInfo.project.name === 'mobile') expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
