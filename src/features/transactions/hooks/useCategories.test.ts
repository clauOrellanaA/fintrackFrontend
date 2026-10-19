import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { jsonResponse } from '../../../test/fixtures';
import { useCategories } from './useCategories';

const category = { id: '11111111-1111-4111-8111-111111111111', name: 'Hogar' };
const token = 'demo-token';
const expire = vi.fn();
const onChanged = vi.fn();

beforeEach(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3100/api/v1');
  expire.mockReset();
  onChanged.mockReset();
});

it('loads categories and refreshes the list after creating one with the session token', async () => {
  let categories: typeof category[] = [];
  const fetcher = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
    if (init?.method === 'POST') {
      categories = [category];
      return jsonResponse(category, 201);
    }
    return jsonResponse(categories);
  });
  vi.stubGlobal('fetch', fetcher);

  const { result } = renderHook(() => useCategories(token, expire, onChanged));
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(result.current.categories).toEqual([]);

  await act(async () => { await result.current.create('Hogar'); });
  await waitFor(() => expect(result.current.categories).toEqual([category]));
  expect(fetcher).toHaveBeenCalledTimes(3);
  expect(fetcher.mock.calls[1]?.[1]).toMatchObject({
    method: 'POST',
    headers: expect.objectContaining({ Authorization: `Bearer ${token}` }),
    body: JSON.stringify({ name: 'Hogar' }),
  });
  expect(onChanged).toHaveBeenCalledOnce();
  expect(result.current.isMutating).toBe(false);
});

it('expires the session on unauthorized category loads and exposes load failures', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ error: { code: 'UNAUTHENTICATED' } }, 401)));
  const { result } = renderHook(() => useCategories(token, expire, onChanged));

  await waitFor(() => expect(result.current.status).toBe('error'));
  expect(expire).toHaveBeenCalledWith(token);
  expect(result.current.categories).toEqual([]);
});

it('keeps category deletion conflicts visible to the caller', async () => {
  vi.stubGlobal('fetch', vi.fn(async (_input: string | URL | Request, init?: RequestInit) => (
    init?.method === 'DELETE'
      ? jsonResponse({ error: { code: 'CONFLICT' } }, 409)
      : jsonResponse([category])
  )));
  const { result } = renderHook(() => useCategories(token, expire, onChanged));
  await waitFor(() => expect(result.current.status).toBe('success'));

  await act(async () => {
    await expect(result.current.remove(category.id)).rejects.toMatchObject({ kind: 'conflict', status: 409 });
  });
  expect(result.current.isMutating).toBe(false);
  expect(expire).not.toHaveBeenCalled();
});
