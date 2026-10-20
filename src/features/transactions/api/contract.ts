import { z } from 'zod';

export const transactionTypeSchema = z.enum(['income', 'expense']);
export const transactionStatusSchema = z.enum(['posted', 'void']);
export const amountSchema = z.string().regex(/^(?=.*[1-9])\d{1,12}\.\d{2}$/);

export const transactionSchema = z.object({
  id: z.uuid(),
  type: transactionTypeSchema,
  amount: amountSchema,
  currency: z.literal('BOB'),
  categoryId: z.uuid().nullable(),
  categoryName: z.string().nullable(),
  occurredAt: z.iso.datetime({ offset: true }),
  description: z.string().max(500).nullable(),
  status: transactionStatusSchema,
}).strict();

export const transactionPageSchema = z.object({
  items: z.array(transactionSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(100),
  totalItems: z.number().int().min(0),
  totalPages: z.number().int().min(0),
}).strict();

export const categorySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(100),
}).strict();
export const categoriesSchema = z.array(categorySchema);

export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionType = z.infer<typeof transactionTypeSchema>;
export type TransactionStatus = z.infer<typeof transactionStatusSchema>;
export type TransactionPage = z.infer<typeof transactionPageSchema>;
export type Category = z.infer<typeof categorySchema>;
export interface TransactionFilters {
  from?: string;
  to?: string;
  type?: TransactionType | 'all';
  status: TransactionStatus | 'all';
  q?: string;
  page: number;
  pageSize: number;
}
export interface TransactionInput {
  type: TransactionType;
  amount: string;
  categoryId: string | null;
  occurredAt: string;
  description: string | null;
}
