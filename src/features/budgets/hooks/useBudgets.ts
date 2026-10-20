import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../shared/api/http';
import { useSession } from '../../../shared/session/SessionProvider';
import { createBudget, deleteBudget, listBudgets, updateBudget } from '../api/budgets';
import type { Budget, CreateBudgetInput } from '../api/contract';

type Result =
  | { status: 'idle' | 'loading' }
  | { status: 'success'; budgets: Budget[] }
  | { status: 'error'; error: unknown };

interface ScopedResult {
  token: string;
  month: string;
  result: Result;
}

export function useBudgets(month: string) {
  const { session, expire } = useSession();
  const token = session?.token;
  const [attempt, setAttempt] = useState(0);
  const [pendingMutations, setPendingMutations] = useState(0);
  const [value, setValue] = useState<ScopedResult | null>(null);
  const latest = useRef(0);
  const retry = useCallback(() => setAttempt(previous => previous + 1), []);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const version = ++latest.current;
    setValue({ token, month, result: { status: 'loading' } });
    listBudgets(token, month, controller.signal).then(budgets => {
      if (!controller.signal.aborted && latest.current === version) {
        setValue({ token, month, result: { status: 'success', budgets } });
      }
    }).catch(error => {
      if (controller.signal.aborted || latest.current !== version) return;
      if (error instanceof ApiError && error.kind === 'unauthenticated') { expire(token); return; }
      setValue({ token, month, result: { status: 'error', error } });
    });
    return () => {
      controller.abort();
      latest.current++;
    };
  }, [token, month, attempt, expire]);

  const mutate = useCallback(async (operation: () => Promise<unknown>) => {
    if (!token) throw new ApiError('unauthenticated');
    setPendingMutations(value => value + 1);
    try {
      const result = await operation();
      retry();
      return result;
    } catch (error) {
      if (error instanceof ApiError && error.kind === 'unauthenticated') expire(token);
      throw error;
    } finally {
      setPendingMutations(value => Math.max(0, value - 1));
    }
  }, [token, expire, retry]);

  const create = useCallback(async (input: CreateBudgetInput) => {
    if (!token) throw new ApiError('unauthenticated');
    return mutate(() => createBudget(token, input));
  }, [token, mutate]);
  const update = useCallback(async (id: string, limit: string) => {
    if (!token) throw new ApiError('unauthenticated');
    return mutate(() => updateBudget(token, id, limit));
  }, [token, mutate]);
  const remove = useCallback(async (id: string) => {
    if (!token) throw new ApiError('unauthenticated');
    return mutate(() => deleteBudget(token, id));
  }, [token, mutate]);

  const result: Result = !token
    ? { status: 'idle' }
    : value?.token === token && value.month === month ? value.result : { status: 'loading' };

  return {
    ...result,
    budgets: result.status === 'success' ? result.budgets : [],
    retry,
    create,
    update,
    remove,
    isMutating: pendingMutations > 0,
  };
}
