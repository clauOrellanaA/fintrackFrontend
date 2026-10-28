import { z } from 'zod';

const money = z.string().regex(/^(?:0|[1-9]\d{0,11})\.\d{2}$/);

export const savingsGoalSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  target: money,
  saved: money,
  remaining: money,
  progress: z.string().regex(/^\d+\.\d{2}$/),
  state: z.enum(['active', 'completed', 'overdue']),
  targetDate: z.string().date().nullable(),
  archived: z.boolean(),
  createdAt: z.iso.datetime({ offset: true }),
  currency: z.literal('BOB'),
}).strict();

export const savingsGoalsSchema = z.array(savingsGoalSchema);

export const savingsEntryResultSchema = z.object({
  entry: z.object({
    id: z.uuid(),
    type: z.enum(['contribution', 'withdrawal']),
    amount: money,
    currency: z.literal('BOB'),
    occurredAt: z.iso.datetime({ offset: true }),
  }).strict(),
  goal: savingsGoalSchema,
}).strict();

export interface SaveSavingsGoalInput { name: string; target: string; targetDate: string | null }
export interface UpdateSavingsGoalInput { name?: string; target?: string; targetDate?: string | null; archived?: boolean }
export interface AddSavingsEntryInput { type: 'contribution' | 'withdrawal'; amount: string }
export type SavingsGoal = z.infer<typeof savingsGoalSchema>;
export type SavingsEntryResult = z.infer<typeof savingsEntryResultSchema>;
