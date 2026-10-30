import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SessionProvider, useSession } from './SessionProvider';
import { deferred, jsonResponse, sessionResponse } from '../../test/fixtures';

const wrapper = ({ children }: { children: ReactNode }) => <SessionProvider>{children}</SessionProvider>;
beforeEach(() => { vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3100/api/v1'); localStorage.clear(); sessionStorage.clear(); });
afterEach(() => vi.useRealTimers());

it('clears local access immediately when remote logout is pending then reports its failure', async () => {
  const pending = deferred<Response>();
  vi.stubGlobal('fetch', vi.fn((url: string) => url.endsWith('/auth/login') ? Promise.resolve(sessionResponse()) : pending.promise));
  const { result } = renderHook(useSession, { wrapper });
  await act(() => result.current.signIn('synthetic@fintrack.test', 'synthetic-password'));
  let logout!: Promise<void>;
  act(() => { logout = result.current.signOut(); });
  expect(result.current.session).toBeNull();
  await act(async () => { pending.resolve(jsonResponse({}, 503)); await logout; });
  expect(result.current.notice).toBe('logout-unconfirmed');
});

it('expires access at the server deadline without retaining a token in browser storage', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-30T12:00:00Z'));
  vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ accessToken: 'synthetic-token', tokenType: 'Bearer', expiresAt: new Date(Date.now() + 1000).toISOString() })));
  const { result } = renderHook(useSession, { wrapper });
  await act(() => result.current.signIn('synthetic@fintrack.test', 'synthetic-password'));
  await act(() => vi.advanceTimersByTimeAsync(1000));
  expect(result.current.session).toBeNull();
  expect(result.current.notice).toBe('expired');
  expect(localStorage.length).toBe(0);
  expect(sessionStorage.length).toBe(0);
});

it('starts a fresh provider without restoring the prior session on reload', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => sessionResponse()));
  const previous = renderHook(useSession, { wrapper });
  await act(() => previous.result.current.signIn('synthetic@fintrack.test', 'synthetic-password'));
  expect(previous.result.current.session).not.toBeNull();
  previous.unmount();
  const next = renderHook(useSession, { wrapper });
  expect(next.result.current.session).toBeNull();
  expect(localStorage.length).toBe(0);
  expect(sessionStorage.length).toBe(0);
});

it('rejects an old login response after the newer login has already established access', async () => {
  const pending = deferred<Response>();
  let attempt = 0;
  vi.stubGlobal('fetch', vi.fn(() => ++attempt === 1 ? pending.promise : Promise.resolve(sessionResponse('new-token'))));
  const { result } = renderHook(useSession, { wrapper });
  let first!: Promise<void>;
  act(() => { first = result.current.signIn('old@fintrack.test', 'synthetic-password').catch(() => undefined); });
  await act(() => result.current.signIn('new@fintrack.test', 'synthetic-password'));
  await act(async () => { pending.resolve(sessionResponse('old-token')); await first; });
  expect(result.current.session).toMatchObject({ token: 'new-token', email: 'new@fintrack.test' });
});
