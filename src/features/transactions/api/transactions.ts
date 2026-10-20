import { z } from 'zod';
import { requestJson, requestVoid } from '../../../shared/api/http';
import { categoriesSchema, categorySchema, transactionPageSchema, transactionSchema, type TransactionFilters, type TransactionInput } from './contract';

export function listTransactions(token: string, filters: TransactionFilters, signal?: AbortSignal) {
  const query = new URLSearchParams({ status: filters.status, page: String(filters.page), pageSize: String(filters.pageSize) });
  if (filters.from) query.set('from', filters.from);
  if (filters.to) query.set('to', filters.to);
  if (filters.type && filters.type !== 'all') query.set('type', filters.type);
  if (filters.q) query.set('q', filters.q);
  return requestJson(`transactions?${query}`, transactionPageSchema, { token, signal });
}

export function listCategories(token: string, signal?: AbortSignal) {
  return requestJson('categories', categoriesSchema, { token, signal });
}

export function createTransaction(token: string, body: TransactionInput) {
  return requestJson('transactions', transactionSchema, { method: 'POST', token, body });
}

export function updateTransaction(token: string, id: string, body: Partial<TransactionInput>) {
  return requestJson(`transactions/${id}`, transactionSchema, { method: 'PATCH', token, body });
}

export function voidTransaction(token: string, id: string) {
  return requestVoid(`transactions/${id}`, { method: 'DELETE', token });
}

export function createCategory(token: string, name: string) {
  return requestJson('categories', categorySchema, { method: 'POST', token, body: { name } });
}

export function updateCategory(token: string, id: string, name: string) {
  return requestJson(`categories/${id}`, categorySchema, { method: 'PATCH', token, body: { name } });
}

export function deleteCategory(token: string, id: string) {
  return requestVoid(`categories/${id}`, { method: 'DELETE', token });
}

export const errorResponseSchema = z.object({ error: z.object({ code: z.string(), message: z.string() }) });
