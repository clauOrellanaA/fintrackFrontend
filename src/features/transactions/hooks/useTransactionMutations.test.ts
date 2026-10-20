import { act, renderHook } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { jsonResponse } from '../../../test/fixtures';
import type { TransactionInput } from '../api/contract';
import { useTransactionMutations } from './useTransactionMutations';

const token = 'demo-token';
const id = '22222222-2222-4222-8222-222222222222';
const expense: TransactionInput = {
  type: 'expense',
  amount: '12.50',
  categoryId: null,
  occurredAt: '2026-10-19T16:00:00.000Z',
  description: 'Almuerzo',
};
const savedTransaction = {
  id,
  ...expense,
  currency: 'BOB',
  categoryName: null,
  status: 'posted',
};

beforeEach(() => vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3100/api/v1'));

it('creates, updates, and voids movements through authenticated API requests', async () => {
  const fetcher = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => (
    init?.method === 'DELETE' ? new Response(null, { status: 204 }) : jsonResponse(savedTransaction)
  ));
  vi.stubGlobal('fetch', fetcher);
  const onChanged = vi.fn();
  const { result } = renderHook(() => useTransactionMutations(token, vi.fn(), onChanged));

  await act(async () => { await result.current.save(expense); });
  await act(async () => { await result.current.save(expense, id); });
  await act(async () => { await result.current.voidMovement(id); });

  expect(fetcher.mock.calls.map(([url, init]) => [String(url), init?.method])).toEqual([
    [`http://localhost:3100/api/v1/transactions`, 'POST'],
    [`http://localhost:3100/api/v1/transactions/${id}`, 'PATCH'],
    [`http://localhost:3100/api/v1/transactions/${id}`, 'DELETE'],
  ]);
  expect(fetcher.mock.calls[0]?.[1]).toMatchObject({
    headers: expect.objectContaining({ Authorization: `Bearer ${token}` }),
    body: JSON.stringify(expense),
  });
  expect(onChanged).toHaveBeenCalledTimes(3);
  expect(result.current.isMutating).toBe(false);
});

it('expires the session and rejects a failed mutation instead of reporting success', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ error: { code: 'UNAUTHENTICATED' } }, 401)));
  const expire = vi.fn();
  const onChanged = vi.fn();
  const { result } = renderHook(() => useTransactionMutations(token, expire, onChanged));

  await act(async () => {
    await expect(result.current.save(expense)).rejects.toMatchObject({ kind: 'unauthenticated', status: 401 });
  });
  expect(expire).toHaveBeenCalledWith(token);
  expect(onChanged).not.toHaveBeenCalled();
  expect(result.current.isMutating).toBe(false);
});
