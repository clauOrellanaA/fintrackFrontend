import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { SessionProvider, useSession } from '../../shared/session/SessionProvider';
import { deferred, jsonResponse, sessionResponse } from '../../test/fixtures';
import { UserProfilePage } from './UserProfilePage';

// Synthetic profiles and credentials, never sent to a live API.
const profileA = { email: 'a@fintrack.test', displayName: 'Cuenta A', openingBalance: '125.50', openingDate: '2026-10-19', currency: 'BOB' };
const profileB = { ...profileA, email: 'b@fintrack.test', displayName: 'Cuenta B', openingBalance: '50.00' };
function Controls() {
  const { session, signIn, expire } = useSession();
  const location = useLocation();
  return <><button onClick={() => void signIn('a@fintrack.test', 'synthetic-password')}>Entrar A</button><button onClick={() => void signIn('b@fintrack.test', 'synthetic-password')}>Entrar B</button><button onClick={() => session && expire(session.token)}>Vencer</button><output data-testid="session-email">{session?.email ?? 'sin sesión'}</output><output data-testid="location">{location.pathname}</output></>;
}
function showAccount() { render(<MemoryRouter initialEntries={['/account']}><SessionProvider><Controls /><UserProfilePage /></SessionProvider></MemoryRouter>); }
function fixtureFetcher(mutation?: (url: string, options: RequestInit) => Promise<Response> | undefined, legacy = false) {
  return vi.fn(async (input: string | URL | Request, options: RequestInit = {}) => {
    const url = String(input);
    if (url.endsWith('/auth/login')) return sessionResponse(JSON.parse(String(options.body)).email.startsWith('a@') ? 'token-a' : 'token-b');
    if (options.method === 'PATCH' || url.endsWith('/auth/password')) {
      const result = mutation?.(url, options);
      if (result) return result;
    }
    if (url.endsWith('/users/me')) return jsonResponse((options.headers as Record<string, string>).Authorization === 'Bearer token-b' ? profileB : { ...profileA, ...(legacy ? { displayName: null } : {}) });
    return new Response(null, { status: 204 });
  });
}
beforeEach(() => vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3100/api/v1'));

it('ignores a late profile save from A after B has signed in', async () => {
  const pending = deferred<Response>();
  vi.stubGlobal('fetch', fixtureFetcher(() => pending.promise));
  showAccount();
  const user = userEvent.setup();
  await user.click(screen.getByText('Entrar A'));
  await screen.findByDisplayValue('Cuenta A');
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await user.click(screen.getByText('Vencer'));
  await user.click(screen.getByText('Entrar B'));
  await screen.findByDisplayValue('Cuenta B');
  await act(async () => pending.resolve(jsonResponse({ ...profileA, email: 'changed-a@fintrack.test' })));
  expect(screen.getByTestId('session-email')).toHaveTextContent('b@fintrack.test');
  expect(screen.getByLabelText('Nombre visible')).toHaveValue('Cuenta B');
  expect(screen.queryByText('Tu perfil se actualizó correctamente.')).not.toBeInTheDocument();
});

it('ignores a late password confirmation from A without signing out B or navigating', async () => {
  const pending = deferred<Response>();
  vi.stubGlobal('fetch', fixtureFetcher(() => pending.promise));
  showAccount();
  const user = userEvent.setup();
  await user.click(screen.getByText('Entrar A'));
  await screen.findByDisplayValue('Cuenta A');
  await user.type(screen.getByLabelText('Contraseña actual'), 'synthetic-password');
  await user.type(screen.getByLabelText('Nueva contraseña'), 'synthetic-password-new');
  await user.type(screen.getByLabelText('Confirma la nueva contraseña'), 'synthetic-password-new');
  await user.click(screen.getByRole('button', { name: 'Actualizar contraseña' }));
  await user.click(screen.getByText('Vencer'));
  await user.click(screen.getByText('Entrar B'));
  await screen.findByDisplayValue('Cuenta B');
  await act(async () => pending.resolve(new Response(null, { status: 204 })));
  expect(screen.getByTestId('session-email')).toHaveTextContent('b@fintrack.test');
  expect(screen.getByTestId('location')).toHaveTextContent('/account');
  expect(screen.getByLabelText('Contraseña actual')).toHaveValue('');
});

it('preserves a legacy unnamed profile by omitting displayName while saving other fields', async () => {
  const fetcher = fixtureFetcher((_url, options) => Promise.resolve(jsonResponse({ ...profileA, displayName: null, ...JSON.parse(String(options.body)) })), true);
  vi.stubGlobal('fetch', fetcher);
  showAccount();
  const user = userEvent.setup();
  await user.click(screen.getByText('Entrar A'));
  await screen.findByDisplayValue('125.50');
  await user.clear(screen.getByLabelText('Saldo inicial (BOB)'));
  await user.type(screen.getByLabelText('Saldo inicial (BOB)'), '200.00');
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(fetcher.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(true));
  const request = fetcher.mock.calls.find(([, init]) => init?.method === 'PATCH')!;
  expect(JSON.parse(String(request[1]?.body))).toEqual({ email: profileA.email, openingBalance: '200.00', openingDate: profileA.openingDate });
  expect(await screen.findByText('Tu perfil se actualizó correctamente.')).toBeVisible();
});

it('reports a profile conflict without success and rejects mismatched or invalid new passwords locally', async () => {
  const fetcher = fixtureFetcher(() => Promise.resolve(jsonResponse({ private: 'synthetic conflict' }, 409)));
  vi.stubGlobal('fetch', fetcher);
  showAccount();
  const user = userEvent.setup();
  await user.click(screen.getByText('Entrar A'));
  await screen.findByDisplayValue('Cuenta A');
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  expect((await screen.findAllByRole('alert'))[0]).toHaveTextContent('Ese correo ya está en uso o la fecha inicial no es compatible con tu historial.');
  expect(screen.queryByText('Tu perfil se actualizó correctamente.')).not.toBeInTheDocument();
  await user.type(screen.getByLabelText('Contraseña actual'), 'synthetic-password');
  await user.type(screen.getByLabelText('Nueva contraseña'), 'new-synthetic-password');
  await user.type(screen.getByLabelText('Confirma la nueva contraseña'), 'different-synthetic-password');
  expect(screen.getByRole('button', { name: 'Actualizar contraseña' })).toBeDisabled();
  expect(screen.getByText('Las contraseñas nuevas no coinciden.')).toBeVisible();
  fireEvent.change(screen.getByLabelText('Nueva contraseña'), { target: { value: 'short' } });
  fireEvent.change(screen.getByLabelText('Confirma la nueva contraseña'), { target: { value: 'short' } });
  expect(screen.getByLabelText('Nueva contraseña')).toHaveAttribute('minLength', '12');
  expect(screen.getByLabelText('Nueva contraseña')).toHaveAttribute('maxLength', '1024');
  expect(fetcher.mock.calls.filter(([url]) => String(url).endsWith('/auth/password'))).toHaveLength(0);
});

it('keeps the current session after the service rejects the current password without claiming success', async () => {
  vi.stubGlobal('fetch', fixtureFetcher(() => Promise.resolve(jsonResponse({}, 401))));
  showAccount();
  const user = userEvent.setup();
  await user.click(screen.getByText('Entrar A'));
  await screen.findByDisplayValue('Cuenta A');
  await user.type(screen.getByLabelText('Contraseña actual'), 'incorrect-synthetic-password');
  await user.type(screen.getByLabelText('Nueva contraseña'), 'new-synthetic-password');
  await user.type(screen.getByLabelText('Confirma la nueva contraseña'), 'new-synthetic-password');
  await user.click(screen.getByRole('button', { name: 'Actualizar contraseña' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('La contraseña actual no coincide o la sesión venció.');
  expect(screen.getByTestId('session-email')).toHaveTextContent('a@fintrack.test');
  expect(screen.queryByText('Contraseña actualizada. Inicia sesión con tu nueva contraseña.')).not.toBeInTheDocument();
});
