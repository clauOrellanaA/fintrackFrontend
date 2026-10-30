import { requestJson } from '../../../shared/api/http';
import { savingsEntryResultSchema, savingsGoalSchema, savingsGoalsSchema, type AddSavingsEntryInput, type SaveSavingsGoalInput, type UpdateSavingsGoalInput } from './contract';

export function listSavingsGoals(token: string, signal?: AbortSignal) {
  return requestJson('savings-goals', savingsGoalsSchema, { token, signal });
}

export function createSavingsGoal(token: string, body: SaveSavingsGoalInput) {
  return requestJson('savings-goals', savingsGoalSchema, { method: 'POST', token, body });
}

export function updateSavingsGoal(token: string, id: string, body: UpdateSavingsGoalInput) {
  return requestJson(`savings-goals/${id}`, savingsGoalSchema, { method: 'PATCH', token, body });
}

export function addSavingsEntry(token: string, id: string, body: AddSavingsEntryInput) {
  return requestJson(`savings-goals/${id}/entries`, savingsEntryResultSchema, { method: 'POST', token, body });
}
