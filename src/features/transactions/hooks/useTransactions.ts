import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../shared/api/http';
import { useSession } from '../../../shared/session/SessionProvider';
import { listTransactions } from '../api/transactions';
import type { TransactionFilters, TransactionPage } from '../api/contract';

type Result = { status: 'idle' | 'loading' } | { status: 'success'; data: TransactionPage } | { status: 'error'; error: unknown };
interface ScopedResult { token: string; key: string; result: Result }

export function useTransactions(filters: TransactionFilters) {
  const { session, expire } = useSession();
  const token = session?.token;
  const [attempt, setAttempt] = useState(0);
  const [value, setValue] = useState<ScopedResult | null>(null);
  const latest = useRef(0);
  const key = JSON.stringify(filters);
  const retry = useCallback(() => setAttempt(previous => previous + 1), []);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const version = ++latest.current;
    setValue({ token, key, result: { status: 'loading' } });
    listTransactions(token, filters, controller.signal).then(data => {
      if (!controller.signal.aborted && latest.current === version) setValue({ token, key, result: { status: 'success', data } });
    }).catch(error => {
      if (controller.signal.aborted || latest.current !== version) return;
      if (error instanceof ApiError && error.kind === 'unauthenticated') { expire(token); return; }
      setValue({ token, key, result: { status: 'error', error } });
    });
    return () => { controller.abort(); latest.current++; };
  }, [token, key, attempt, expire]);

  const result: Result = !token ? { status: 'idle' } : value?.token === token && value.key === key ? value.result : { status: 'loading' };
  return { ...result, retry };
}
