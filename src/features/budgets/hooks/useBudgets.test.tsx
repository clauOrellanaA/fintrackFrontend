import { act, renderHook, waitFor } from '@testing-library/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { jsonResponse, sessionResponse } from '../../../test/fixtures';
import { SessionProvider, useSession } from '../../../shared/session/SessionProvider';
import { useBudgets } from './useBudgets';

const budget = {
  id: '11111111-1111-4111-8111-111111111111',
  categoryId: '22222222-2222-4222-8222-222222222222',
  categoryName: 'Hogar',
  limit: '100.00',
  spent: '80.00',
  remaining: '20.00',
  progress: '80.00',
  state: 'warning',
};

beforeEach(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3100/api/v1');
});

it('loads the selected month and uses exact API payloads for create, update, and delete', async () => {
  const requests: Array<{ url: string; method: string; body: string | undefined }> = [];
  let budgets = [budget];
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    requests.push({ url, method, body: typeof init?.body === 'string' ? init.body : undefined });
    if (url.endsWith('/auth/login')) return sessionResponse();
    if (method === 'POST') { budgets = [budget]; return jsonResponse(budget, 201); }
    if (method === 'PATCH') { budgets = [{ ...budget, limit: '120.00' }]; return jsonResponse(budgets[0]); }
    if (method === 'DELETE') { budgets = []; return new Response(null, { status: 204 }); }
    return jsonResponse(budgets);
  }));

  function Wrapper({ children }: { children: ReactNode }) {
    const { signIn } = useSession();
    const started = useRef(false);
    useEffect(() => {
      if (started.current) return;
      started.current = true;
      void signIn('alice@fintrack.test', 'local-test-password');
    }, [signIn]);
    return <>{children}</>;
  }
  const wrapper = ({ children }: { children: ReactNode }) => <SessionProvider><Wrapper>{children}</Wrapper></SessionProvider>;
  const { result } = renderHook(() => useBudgets('2026-10'), { wrapper });
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(result.current.budgets).toEqual([budget]);

  await act(async () => {
    await result.current.create({ categoryId: budget.categoryId, month: '2026-10', limit: '100.00' });
  });
  await waitFor(() => expect(requests.filter(request => request.method === 'GET')).toHaveLength(2));
  await act(async () => { await result.current.update(budget.id, '120.00'); });
  await waitFor(() => expect(requests.filter(request => request.method === 'GET')).toHaveLength(3));
  await act(async () => { await result.current.remove(budget.id); });
  await waitFor(() => expect(requests.filter(request => request.method === 'GET')).toHaveLength(4));

  expect(requests[0]?.url).toContain('/auth/login');
  expect(requests.find(request => request.url.endsWith('/budgets') && request.method === 'POST')?.body).toBe(JSON.stringify({ categoryId: budget.categoryId, month: '2026-10', limit: '100.00' }));
  expect(requests.find(request => request.method === 'PATCH')?.body).toBe(JSON.stringify({ limit: '120.00' }));
  expect(requests.some(request => request.method === 'DELETE')).toBe(true);
  expect(result.current.isMutating).toBe(false);
});
