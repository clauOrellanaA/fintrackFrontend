import { z } from 'zod';
import { requestJson, requestVoid } from '../api/http';

const sessionSchema = z.object({ accessToken: z.string().min(1), tokenType: z.literal('Bearer'), expiresAt: z.iso.datetime({ offset: true }) });
export function login(email: string, password: string, signal: AbortSignal) {
  return requestJson('auth/login', sessionSchema, { method: 'POST', body: { email, password }, signal });
}
export function logout(token: string) { return requestVoid('auth/session', { method: 'DELETE', token }); }
