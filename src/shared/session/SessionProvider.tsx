import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { login, logout } from './api';

interface Session { token: string; email: string; expiresAt: string }
type Notice = 'expired' | 'logout-unconfirmed' | null;
interface SessionContextValue {
  session: Session | null;
  notice: Notice;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  expire(token: string): void;
}
const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const current = useRef<Session | null>(null);
  const generation = useRef(0);
  const pending = useRef<AbortController | null>(null);
  const expire = useCallback((token: string) => {
    if (current.current?.token !== token) return;
    generation.current++;
    current.current = null;
    setSession(null);
    setNotice('expired');
  }, []);
  async function signIn(email: string, password: string) {
    const version = ++generation.current;
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    current.current = null;
    setSession(null);
    setNotice(null);
    const result = await login(email.trim().toLowerCase(), password, controller.signal);
    if (generation.current !== version || controller.signal.aborted) return;
    const next = { token: result.accessToken, email: email.trim().toLowerCase(), expiresAt: result.expiresAt };
    current.current = next;
    setSession(next);
  }
  async function signOut() {
    const previous = current.current;
    const version = ++generation.current;
    pending.current?.abort();
    current.current = null;
    setSession(null);
    setNotice(null);
    if (!previous) return;
    try { await logout(previous.token); }
    catch { if (generation.current === version) setNotice('logout-unconfirmed'); }
  }
  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(() => expire(session.token), Math.max(0, new Date(session.expiresAt).getTime() - Date.now()));
    return () => clearTimeout(timer);
  }, [session, expire]);
  useEffect(() => () => { pending.current?.abort(); }, []);
  return <SessionContext.Provider value={{ session, notice, signIn, signOut, expire }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('SessionProvider is required');
  return context;
}
