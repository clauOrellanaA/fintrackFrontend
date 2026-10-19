import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { SessionProvider, useSession } from '../../../shared/session/SessionProvider';
import { dashboardFixture, deferred, jsonResponse, sessionResponse } from '../../../test/fixtures';
import { useDashboard } from './useDashboard';

const wrapper = ({ children }: { children: ReactNode }) => <SessionProvider>{children}</SessionProvider>;
beforeEach(() => { vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3100/api/v1'); localStorage.clear(); sessionStorage.clear(); });
const usePanel = (month: string) => ({ auth: useSession(), panel: useDashboard(month) });

it('ignores an older month response even when the transport ignores cancellation', async () => {
  const old = deferred<Response>(), next = deferred<Response>();
  vi.stubGlobal('fetch', vi.fn((url: string) => url.endsWith('/auth/login') ? Promise.resolve(sessionResponse()) : url.includes('2026-10') ? old.promise : next.promise));
  const { result, rerender } = renderHook(({ month }) => usePanel(month), { wrapper, initialProps: { month: '2026-10' } });
  await act(() => result.current.auth.signIn('alice@fintrack.test', 'test-password'));
  rerender({ month: '2026-11' });
  await act(async () => { next.resolve(jsonResponse(dashboardFixture('2026-11'))); });
  await waitFor(() => expect(result.current.panel.status).toBe('success'));
  await act(async () => { old.resolve(jsonResponse(dashboardFixture('2026-10'))); });
  const panel = result.current.panel;
  expect(panel.status === 'success' && panel.data.period.month).toBe('2026-11');
});

it('clears private state before logout resolves and never stores the token in browser storage', async () => {
  const deletion = deferred<Response>();
  vi.stubGlobal('fetch', vi.fn((url: string, options: RequestInit) => options.method === 'DELETE' ? deletion.promise : url.endsWith('/auth/login') ? Promise.resolve(sessionResponse()) : Promise.resolve(jsonResponse(dashboardFixture()))));
  const { result } = renderHook(() => usePanel('2026-10'), { wrapper });
  await act(() => result.current.auth.signIn('alice@fintrack.test', 'test-password'));
  await waitFor(() => expect(result.current.panel.status).toBe('success'));
  expect(localStorage.length).toBe(0); expect(sessionStorage.length).toBe(0);
  let loggingOut!: Promise<void>;
  act(() => { loggingOut = result.current.auth.signOut(); });
  expect(result.current.auth.session).toBeNull(); expect(result.current.panel.status).toBe('idle');
  await act(async () => { deletion.resolve(new Response(null, { status: 204 })); await loggingOut; });
});

it('prevents an old account response from replacing or expiring a newer session', async () => {
  const old = deferred<Response>();
  let logins = 0;
  vi.stubGlobal('fetch', vi.fn((url: string, options: RequestInit) => {
    if (url.endsWith('/auth/login')) return Promise.resolve(sessionResponse((++logins === 1 ? 'a' : 'b').repeat(43)));
    return (options.headers as Record<string, string>).Authorization.includes('aaa') ? old.promise : Promise.resolve(jsonResponse(dashboardFixture()));
  }));
  const { result } = renderHook(() => usePanel('2026-10'), { wrapper });
  await act(() => result.current.auth.signIn('alice@fintrack.test', 'test-password'));
  await act(() => result.current.auth.signIn('bob@fintrack.test', 'test-password'));
  await waitFor(() => expect(result.current.panel.status).toBe('success'));
  await act(async () => { old.resolve(jsonResponse({ error: { code: 'UNAUTHENTICATED' } }, 401)); });
  expect(result.current.auth.session?.email).toBe('bob@fintrack.test'); expect(result.current.panel.status).toBe('success');
});

it('clears an invalid session instead of showing financial zeros', async () => {
  vi.stubGlobal('fetch', vi.fn((url: string) => Promise.resolve(url.endsWith('/auth/login') ? sessionResponse() : jsonResponse({ error: { code: 'UNAUTHENTICATED' } }, 401))));
  const { result } = renderHook(() => usePanel('2026-10'), { wrapper });
  await act(() => result.current.auth.signIn('alice@fintrack.test', 'test-password'));
  await waitFor(() => expect(result.current.auth.notice).toBe('expired'));
  expect(result.current.auth.session).toBeNull(); expect(result.current.panel.status).toBe('idle');
});

it('allows retry after a network failure without retaining a successful result from another request', async () => {
  let queries = 0;
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.endsWith('/auth/login')) return Promise.resolve(sessionResponse());
    return ++queries === 1 ? Promise.reject(new TypeError('Network failed')) : Promise.resolve(jsonResponse(dashboardFixture()));
  }));
  const { result } = renderHook(() => usePanel('2026-10'), { wrapper });
  await act(() => result.current.auth.signIn('alice@fintrack.test', 'test-password'));
  await waitFor(() => expect(result.current.panel.status).toBe('error'));
  act(() => result.current.panel.retry());
  await waitFor(() => expect(result.current.panel.status).toBe('success'));
  expect(queries).toBe(2);
});
