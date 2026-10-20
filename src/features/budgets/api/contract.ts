import { z } from 'zod';

export const budgetSchema = z.object({
  id: z.uuid(),
  categoryId: z.uuid(),
  categoryName: z.string(),
  limit: z.string().regex(/^(?:0|[1-9]\d{0,11})\.\d{2}$/),
  spent: z.string().regex(/^\d{1,12}\.\d{2}$/),
  remaining: z.string().regex(/^-?\d{1,12}\.\d{2}$/),
  progress: z.string().regex(/^\d+\.\d{2}$/),
  state: z.enum(['normal', 'warning', 'exceeded']),
}).strict();

export const budgetsSchema = z.array(budgetSchema);

export interface CreateBudgetInput {
  categoryId: string;
  month: string;
  limit: string;
}

export type Budget = z.infer<typeof budgetSchema>;
