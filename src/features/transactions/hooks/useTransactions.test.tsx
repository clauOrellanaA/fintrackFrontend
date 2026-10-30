import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { SessionProvider, useSession } from '../../../shared/session/SessionProvider';
import { deferred, jsonResponse, sessionResponse } from '../../../test/fixtures';
import type { TransactionFilters } from '../api/contract';
import { useTransactions } from './useTransactions';

const wrapper = ({ children }: { children: ReactNode }) => <SessionProvider>{children}</SessionProvider>;
const filters: TransactionFilters = { status: 'posted', page: 1, pageSize: 10 };
const emptyPage = { items: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 0 };
const useHistory = (query: TransactionFilters) => ({ auth: useSession(), history: useTransactions(query) });
beforeEach(() => vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3100/api/v1'));

it('distinguishes pending loading from a valid empty history', async () => {
  const pending = deferred<Response>();
  vi.stubGlobal('fetch', vi.fn((url: string) => url.endsWith('/auth/login') ? Promise.resolve(sessionResponse()) : pending.promise));
  const { result } = renderHook(() => useHistory(filters), { wrapper });
  expect(result.current.history.status).toBe('idle');
  await act(() => result.current.auth.signIn('synthetic@fintrack.test', 'synthetic-password'));
  expect(result.current.history.status).toBe('loading');
  await act(async () => pending.resolve(jsonResponse(emptyPage)));
  expect(result.current.history).toMatchObject({ status: 'success', data: { items: [], totalItems: 0 } });
});

it('ignores a late filter response after the latest filtered query succeeds', async () => {
  const pending = deferred<Response>();
  vi.stubGlobal('fetch', vi.fn((url: string) => url.endsWith('/auth/login') ? Promise.resolve(sessionResponse()) : new URL(url).searchParams.get('q') === 'old' ? pending.promise : Promise.resolve(jsonResponse(emptyPage))));
  const { result, rerender } = renderHook(({ q }) => useHistory({ ...filters, q }), { wrapper, initialProps: { q: 'old' } });
  await act(() => result.current.auth.signIn('synthetic@fintrack.test', 'synthetic-password'));
  rerender({ q: 'current' });
  await waitFor(() => expect(result.current.history.status).toBe('success'));
  await act(async () => pending.resolve(jsonResponse({}, 503)));
  expect(result.current.history).toMatchObject({ status: 'success', data: emptyPage });
});

it.each([200, 401])('ignores an old account query with HTTP %s after switching to a new account', async status => {
  const pending = deferred<Response>();
  let logins = 0;
  vi.stubGlobal('fetch', vi.fn((url: string, options: RequestInit) => {
    if (url.endsWith('/auth/login')) return Promise.resolve(sessionResponse(++logins === 1 ? 'old-token' : 'new-token'));
    return (options.headers as Record<string, string>).Authorization === 'Bearer old-token' ? pending.promise : Promise.resolve(jsonResponse(emptyPage));
  }));
  const { result } = renderHook(() => useHistory(filters), { wrapper });
  await act(() => result.current.auth.signIn('old@fintrack.test', 'synthetic-password'));
  await act(() => result.current.auth.signIn('new@fintrack.test', 'synthetic-password'));
  await waitFor(() => expect(result.current.history.status).toBe('success'));
  await act(async () => pending.resolve(jsonResponse(status === 200 ? { ...emptyPage, totalItems: 12 } : {}, status)));
  expect(result.current.auth.session?.email).toBe('new@fintrack.test');
  expect(result.current.history).toMatchObject({ status: 'success', data: emptyPage });
});

it('exposes a recoverable query failure and retries instead of presenting it as an empty result', async () => {
  let attempts = 0;
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.endsWith('/auth/login')) return Promise.resolve(sessionResponse());
    return ++attempts === 1 ? Promise.reject(new TypeError('synthetic network failure')) : Promise.resolve(jsonResponse(emptyPage));
  }));
  const { result } = renderHook(() => useHistory(filters), { wrapper });
  await act(() => result.current.auth.signIn('synthetic@fintrack.test', 'synthetic-password'));
  await waitFor(() => expect(result.current.history.status).toBe('error'));
  expect(result.current.history).not.toHaveProperty('data');
  act(() => result.current.history.retry());
  await waitFor(() => expect(result.current.history).toMatchObject({ status: 'success', data: emptyPage }));
  expect(attempts).toBe(2);
});

it('expires the current account on a matching 401 without showing empty financial results', async () => {
  vi.stubGlobal('fetch', vi.fn((url: string) => Promise.resolve(url.endsWith('/auth/login') ? sessionResponse() : jsonResponse({}, 401))));
  const { result } = renderHook(() => useHistory(filters), { wrapper });
  await act(() => result.current.auth.signIn('synthetic@fintrack.test', 'synthetic-password'));
  await waitFor(() => expect(result.current.auth.notice).toBe('expired'));
  expect(result.current.auth.session).toBeNull();
  expect(result.current.history.status).toBe('idle');
});
