import { z } from 'zod';
import { requestJson, requestVoid } from '../api/http';

const sessionSchema = z.object({ accessToken: z.string().min(1), tokenType: z.literal('Bearer'), expiresAt: z.iso.datetime({ offset: true }) });
const profileSchema = z.object({
  email: z.email().max(254),
  displayName: z.string().max(80).nullable(),
  openingBalance: z.string().regex(/^-?(0|[1-9][0-9]{0,11})\.[0-9]{2}$/),
  openingDate: z.iso.date(),
  currency: z.literal('BOB'),
});
export type UserProfile = z.infer<typeof profileSchema>;
export type ProfileUpdate = Partial<Pick<UserProfile, 'email' | 'openingBalance' | 'openingDate'>> & { displayName?: string };

export function login(email: string, password: string, signal: AbortSignal) {
  return requestJson('auth/login', sessionSchema, { method: 'POST', body: { email, password }, signal });
}
export function registerAccount(email: string, password: string, displayName: string, signal: AbortSignal) {
  return requestJson('auth/register', sessionSchema, { method: 'POST', body: { email, password, displayName }, signal });
}
export function logout(token: string) { return requestVoid('auth/session', { method: 'DELETE', token }); }
export function getProfile(token: string, signal?: AbortSignal) {
  return requestJson('users/me', profileSchema, { token, signal });
}
export function updateProfile(token: string, body: ProfileUpdate) {
  return requestJson('users/me', profileSchema, { method: 'PATCH', token, body });
}
export function changePassword(token: string, currentPassword: string, newPassword: string) {
  return requestVoid('auth/password', { method: 'POST', token, body: { currentPassword, newPassword } });
}
