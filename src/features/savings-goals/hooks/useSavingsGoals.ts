import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../shared/api/http';
import { useSession } from '../../../shared/session/SessionProvider';
import { addSavingsEntry, createSavingsGoal, listSavingsGoals, updateSavingsGoal } from '../api/savingsGoals';
import type { AddSavingsEntryInput, SaveSavingsGoalInput, SavingsGoal, UpdateSavingsGoalInput } from '../api/contract';

type Result = { status: 'idle' | 'loading' } | { status: 'success'; goals: SavingsGoal[] } | { status: 'error'; error: unknown };

export function useSavingsGoals() {
  const { session, expire } = useSession();
  const token = session?.token;
  const [attempt, setAttempt] = useState(0);
  const [pendingMutations, setPendingMutations] = useState(0);
  const [value, setValue] = useState<{ token: string; result: Result } | null>(null);
  const latest = useRef(0);
  const retry = useCallback(() => setAttempt(previous => previous + 1), []);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const version = ++latest.current;
    setValue({ token, result: { status: 'loading' } });
    listSavingsGoals(token, controller.signal).then(goals => {
      if (!controller.signal.aborted && latest.current === version) setValue({ token, result: { status: 'success', goals } });
    }).catch(error => {
      if (controller.signal.aborted || latest.current !== version) return;
      if (error instanceof ApiError && error.kind === 'unauthenticated') { expire(token); return; }
      setValue({ token, result: { status: 'error', error } });
    });
    return () => { controller.abort(); latest.current++; };
  }, [token, attempt, expire]);

  const mutate = useCallback(async (operation: () => Promise<unknown>) => {
    if (!token) throw new ApiError('unauthenticated');
    setPendingMutations(value => value + 1);
    try { const result = await operation(); retry(); return result; }
    catch (error) { if (error instanceof ApiError && error.kind === 'unauthenticated') expire(token); throw error; }
    finally { setPendingMutations(value => Math.max(0, value - 1)); }
  }, [token, expire, retry]);

  const create = useCallback((input: SaveSavingsGoalInput) => mutate(() => createSavingsGoal(token ?? '', input)), [token, mutate]);
  const update = useCallback((id: string, input: UpdateSavingsGoalInput) => mutate(() => updateSavingsGoal(token ?? '', id, input)), [token, mutate]);
  const addEntry = useCallback((id: string, input: AddSavingsEntryInput) => mutate(() => addSavingsEntry(token ?? '', id, input)), [token, mutate]);

  const result: Result = !token ? { status: 'idle' } : value?.token === token ? value.result : { status: 'loading' };
  return { ...result, goals: result.status === 'success' ? result.goals : [], retry, create, update, addEntry, isMutating: pendingMutations > 0 };
}
