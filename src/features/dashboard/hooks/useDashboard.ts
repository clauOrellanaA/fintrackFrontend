import { useEffect, useRef, useState } from 'react';
import { useSession } from '../../../shared/session/SessionProvider';
import { ApiError } from '../../../shared/api/http';
import { getDashboard } from '../api/dashboard';
import type { Dashboard } from '../api/contract';

type Result = { status: 'idle' | 'loading' } | { status: 'success'; data: Dashboard } | { status: 'error'; error: unknown };
interface ScopedResult { token: string; month: string; result: Result }

export function useDashboard(month: string) {
  const { session, expire } = useSession();
  const token = session?.token;
  const [attempt, setAttempt] = useState(0);
  const [value, setValue] = useState<ScopedResult | null>(null);
  const latest = useRef(0);
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const version = ++latest.current;
    setValue({ token, month, result: { status: 'loading' } });
    getDashboard(token, month, controller.signal).then(data => {
      if (!controller.signal.aborted && latest.current === version) setValue({ token, month, result: { status: 'success', data } });
    }).catch(error => {
      if (controller.signal.aborted || latest.current !== version) return;
      if (error instanceof ApiError && error.kind === 'unauthenticated') { expire(token); return; }
      setValue({ token, month, result: { status: 'error', error } });
    });
    return () => { controller.abort(); latest.current++; };
  }, [token, month, attempt, expire]);
  const result: Result = !token ? { status: 'idle' } : value?.token === token && value.month === month ? value.result : { status: 'loading' };
  return { ...result, retry: () => setAttempt(previous => previous + 1) };
}
