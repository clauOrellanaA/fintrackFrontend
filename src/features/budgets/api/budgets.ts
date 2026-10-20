import { requestJson, requestVoid } from '../../../shared/api/http';
import { budgetsSchema, budgetSchema, type CreateBudgetInput } from './contract';

export function listBudgets(token: string, month: string, signal?: AbortSignal) {
  return requestJson(`budgets?month=${encodeURIComponent(month)}`, budgetsSchema, { token, signal });
}

export function createBudget(token: string, body: CreateBudgetInput) {
  return requestJson('budgets', budgetSchema, { method: 'POST', token, body });
}

export function updateBudget(token: string, id: string, limit: string) {
  return requestJson(`budgets/${id}`, budgetSchema, { method: 'PATCH', token, body: { limit } });
}

export function deleteBudget(token: string, id: string) {
  return requestVoid(`budgets/${id}`, { method: 'DELETE', token });
}
