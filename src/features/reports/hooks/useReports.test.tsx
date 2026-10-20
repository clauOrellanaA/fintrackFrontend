import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { SessionProvider, useSession } from '../../../shared/session/SessionProvider';
import { jsonResponse as sessionResponse } from '../../../test/fixtures';
import { deferred, jsonResponse, reportsFixture } from '../test/fixtures';
import { useReports } from './useReports';

const wrapper = ({ children }: { children: ReactNode }) => <SessionProvider>{children}</SessionProvider>;
const useReportWithSession = (from: string, to: string) => ({ auth: useSession(), report: useReports(from, to) });

beforeEach(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3100/api/v1');
  localStorage.clear();
  sessionStorage.clear();
});

it('does not let a late synthetic response overwrite the newest selected period', async () => {
  const first = deferred<Response>();
  const second = deferred<Response>();
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.endsWith('/auth/login')) return Promise.resolve(sessionResponse({ accessToken: 'a'.repeat(43), tokenType: 'Bearer', expiresAt: new Date(Date.now() + 3_600_000).toISOString() }));
    return url.includes('from=2026-01-01') ? first.promise : second.promise;
  }));
  const { result, rerender } = renderHook(({ from, to }) => useReportWithSession(from, to), { wrapper, initialProps: { from: '2026-01-01', to: '2026-02-28' } });
  await act(() => result.current.auth.signIn('reports@fintrack.test', 'synthetic-password'));
  rerender({ from: '2026-02-01', to: '2026-03-31' });
  await act(async () => { second.resolve(jsonResponse(reportsFixture({ period: { ...reportsFixture().period, from: '2026-02-01', to: '2026-03-31' } }))); });
  await waitFor(() => expect(result.current.report.status).toBe('success'));
  await act(async () => { first.resolve(jsonResponse(reportsFixture())); });
  expect(result.current.report.status === 'success' && result.current.report.data.period.from).toBe('2026-02-01');
});

it('expires the matching session after a 401 and removes private report state', async () => {
  vi.stubGlobal('fetch', vi.fn((url: string) => url.endsWith('/auth/login')
    ? Promise.resolve(sessionResponse({ accessToken: 'b'.repeat(43), tokenType: 'Bearer', expiresAt: new Date(Date.now() + 3_600_000).toISOString() }))
    : Promise.resolve(jsonResponse({ error: { code: 'UNAUTHENTICATED' } }, 401))));
  const { result } = renderHook(() => useReportWithSession('2026-01-01', '2026-02-28'), { wrapper });
  await act(() => result.current.auth.signIn('reports@fintrack.test', 'synthetic-password'));
  await waitFor(() => expect(result.current.auth.notice).toBe('expired'));
  expect(result.current.auth.session).toBeNull();
  expect(result.current.report.status).toBe('idle');
});
