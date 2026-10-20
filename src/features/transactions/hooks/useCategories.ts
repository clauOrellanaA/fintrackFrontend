import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../shared/api/http';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../api/transactions';
import type { Category } from '../api/contract';

function requireToken(token: string | undefined): string {
  if (!token) throw new ApiError('unauthenticated');
  return token;
}

type CategoriesResult =
  | { status: 'idle' | 'loading' }
  | { status: 'success'; categories: Category[] }
  | { status: 'error'; error: unknown };

export function useCategories(token: string | undefined, expire: (token: string) => void, onChanged: () => void) {
  const [result, setResult] = useState<CategoriesResult>({ status: 'idle' });
  const [attempt, setAttempt] = useState(0);
  const [pendingMutations, setPendingMutations] = useState(0);
  const requestVersion = useRef(0);
  const retry = useCallback(() => setAttempt(value => value + 1), []);

  useEffect(() => {
    if (!token) {
      setResult({ status: 'idle' });
      return;
    }
    const controller = new AbortController();
    const version = ++requestVersion.current;
    setResult({ status: 'loading' });
    listCategories(token, controller.signal).then(categories => {
      if (!controller.signal.aborted && requestVersion.current === version) setResult({ status: 'success', categories });
    }).catch(error => {
      if (controller.signal.aborted || requestVersion.current !== version) return;
      if (error instanceof ApiError && error.kind === 'unauthenticated') expire(token);
      setResult({ status: 'error', error });
    });
    return () => {
      controller.abort();
      requestVersion.current++;
    };
  }, [token, attempt, expire]);

  const mutate = useCallback(async (operation: () => Promise<unknown>) => {
    if (!token) throw new ApiError('unauthenticated');
    setPendingMutations(value => value + 1);
    try {
      const value = await operation();
      retry();
      onChanged();
      return value;
    } catch (error) {
      if (error instanceof ApiError && error.kind === 'unauthenticated') expire(token);
      throw error;
    } finally {
      setPendingMutations(value => Math.max(0, value - 1));
    }
  }, [token, expire, onChanged, retry]);

  const create = useCallback((name: string) => mutate(() => createCategory(requireToken(token), name)), [token, mutate]);
  const rename = useCallback((id: string, name: string) => mutate(() => updateCategory(requireToken(token), id, name)), [token, mutate]);
  const remove = useCallback((id: string) => mutate(() => deleteCategory(requireToken(token), id)), [token, mutate]);

  return {
    ...result,
    categories: result.status === 'success' ? result.categories : [],
    retry,
    create,
    rename,
    remove,
    isMutating: pendingMutations > 0,
  };
}
