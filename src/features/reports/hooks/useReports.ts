import { useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../shared/api/http';
import { useSession } from '../../../shared/session/SessionProvider';
import type { ReportsResponse } from '../api/contract';
import { getReports } from '../api/reports';

type Result = { status: 'idle' | 'loading' } | { status: 'success'; data: ReportsResponse } | { status: 'error'; error: unknown };
interface ScopedResult { token: string; from: string; to: string; result: Result }

export function useReports(from: string, to: string) {
  const { session, expire } = useSession();
  const token = session?.token;
  const [attempt, setAttempt] = useState(0);
  const [value, setValue] = useState<ScopedResult | null>(null);
  const latest = useRef(0);
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const version = ++latest.current;
    setValue({ token, from, to, result: { status: 'loading' } });
    getReports(token, from, to, controller.signal).then(data => {
      if (!controller.signal.aborted && latest.current === version) setValue({ token, from, to, result: { status: 'success', data } });
    }).catch(error => {
      if (controller.signal.aborted || latest.current !== version) return;
      if (error instanceof ApiError && error.kind === 'unauthenticated') { expire(token); return; }
      setValue({ token, from, to, result: { status: 'error', error } });
    });
    return () => { controller.abort(); latest.current++; };
  }, [token, from, to, attempt, expire]);
  const result: Result = !token ? { status: 'idle' } : value?.token === token && value.from === from && value.to === to ? value.result : { status: 'loading' };
  return { ...result, retry: () => setAttempt(previous => previous + 1) };
}
