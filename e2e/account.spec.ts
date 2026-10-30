import { test, expect } from '@playwright/test';

// Synthetic HTTP fixtures only; this does not exercise a real service.
const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
test('valida longitud y confirmación de contraseña antes de enviar y mantiene el error del servicio', async ({ page }) => {
  let passwordRequests = 0;
  await page.route('**/api/v1/**', async route => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (request.url().endsWith('/auth/login')) return route.fulfill({ headers, json: { accessToken: 'synthetic-token', tokenType: 'Bearer', expiresAt: new Date(Date.now() + 3600000).toISOString() } });
    if (request.url().endsWith('/users/me')) return route.fulfill({ headers, json: { email: 'synthetic@fintrack.test', displayName: 'Cuenta sintética', openingBalance: '0.00', openingDate: '2026-10-01', currency: 'BOB' } });
    if (request.url().endsWith('/auth/password')) { passwordRequests++; return route.fulfill({ headers, status: 401, json: {} }); }
    return route.fulfill({ status: 204, headers });
  });
  await page.goto('/account');
  await page.getByLabel('Correo electrónico').fill('synthetic@fintrack.test');
  await page.getByLabel('Contraseña', { exact: true }).fill('synthetic-password');
  await page.getByRole('button', { name: 'Entrar a mi panel' }).click();
  await expect(page.getByLabel('Nombre visible')).toHaveValue('Cuenta sintética');
  await page.getByLabel('Contraseña actual').fill('incorrect-password');
  await page.getByLabel('Nueva contraseña', { exact: true }).fill('short');
  await page.getByLabel('Confirma la nueva contraseña').fill('short');
  await page.getByRole('button', { name: 'Actualizar contraseña' }).click();
  expect(await page.getByLabel('Nueva contraseña', { exact: true }).evaluate(input => (input as HTMLInputElement).validity.tooShort)).toBe(true);
  expect(passwordRequests).toBe(0);
  await page.getByLabel('Nueva contraseña', { exact: true }).fill('new-synthetic-password');
  await page.getByLabel('Confirma la nueva contraseña').fill('different-password');
  await expect(page.getByRole('button', { name: 'Actualizar contraseña' })).toBeDisabled();
  await page.getByLabel('Confirma la nueva contraseña').fill('new-synthetic-password');
  await page.getByRole('button', { name: 'Actualizar contraseña' }).click();
  await expect(page.getByRole('alert')).toContainText('La contraseña actual no coincide o la sesión venció.');
  expect(passwordRequests).toBe(1);
  await expect(page.getByLabel('Nombre visible')).toHaveValue('Cuenta sintética');
});
