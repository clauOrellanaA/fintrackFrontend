import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { App } from '../../app/App';
import { dashboardFixture, jsonResponse, sessionResponse } from '../../test/fixtures';

it('registers an account, updates its profile and requires sign-in after changing the password', async () => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3100/api/v1');
  window.history.replaceState({}, '', '/dashboard');
  let profile = {
    email: 'new.user@fintrack.test',
    displayName: 'New user',
    openingBalance: '0.00',
    openingDate: '2026-10-19',
    currency: 'BOB',
  };
  const fetchMock = vi.fn(async (input: string | URL, options: RequestInit = {}) => {
    const url = String(input);
    if (url.endsWith('/auth/register')) return jsonResponse({ accessToken: 'r'.repeat(43), tokenType: 'Bearer', expiresAt: new Date(Date.now() + 3600000).toISOString() }, 201);
    if (url.endsWith('/users/me') && options.method === 'PATCH') {
      profile = { ...profile, ...JSON.parse(String(options.body)) };
      return jsonResponse(profile);
    }
    if (url.endsWith('/users/me')) return jsonResponse(profile);
    if (url.includes('/dashboard?')) {
      const month = new URL(url).searchParams.get('month') ?? '2026-10';
      return jsonResponse(dashboardFixture(month));
    }
    if (url.endsWith('/auth/password')) return new Response(null, { status: 204 });
    if (url.endsWith('/auth/login')) return sessionResponse();
    return new Response(null, { status: 204 });
  });
  vi.stubGlobal('fetch', fetchMock);

  render(<App />);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Crear una cuenta' }));
  await user.type(screen.getByLabelText('Nombre visible'), 'New user');
  await user.type(screen.getByLabelText('Correo electrónico'), 'new.user@fintrack.test');
  await user.type(screen.getByLabelText('Contraseña', { exact: true }), 'long-password-1234');
  await user.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));

  await screen.findByText('Tu información está conectada');
  const registration = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/auth/register'));
  expect(JSON.parse(String(registration?.[1]?.body))).toEqual({
    email: 'new.user@fintrack.test', password: 'long-password-1234', displayName: 'New user',
  });
  await user.click(screen.getAllByRole('link', { name: 'Mi cuenta' })[0]);
  expect(await screen.findByRole('heading', { name: 'Perfil y seguridad.' })).toBeVisible();
  await screen.findByDisplayValue('0.00');

  await user.clear(screen.getByLabelText('Correo electrónico'));
  await user.type(screen.getByLabelText('Correo electrónico'), 'updated@fintrack.test');
  await user.clear(screen.getByLabelText('Saldo inicial (BOB)'));
  await user.type(screen.getByLabelText('Saldo inicial (BOB)'), '125.50');
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  expect(await screen.findByText('Tu perfil se actualizó correctamente.')).toBeVisible();
  expect(await screen.findByTitle('updated@fintrack.test')).toBeVisible();

  await user.type(screen.getByLabelText('Contraseña actual'), 'long-password-1234');
  await user.type(screen.getByLabelText('Nueva contraseña'), 'another-long-password');
  await user.type(screen.getByLabelText('Confirma la nueva contraseña'), 'another-long-password');
  await user.click(screen.getByRole('button', { name: 'Actualizar contraseña' }));
  expect(await screen.findByText('Contraseña actualizada. Inicia sesión con tu nueva contraseña.')).toBeVisible();
  await waitFor(() => expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith('/auth/password'))).toBe(true));
  expect(screen.getByRole('heading', { name: 'Tu panel te espera' })).toBeVisible();
}, 15000);
