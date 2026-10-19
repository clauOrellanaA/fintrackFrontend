import { z } from 'zod';

const money = z.string().regex(/^-?\d{1,12}\.\d{2}$/);
const percentage = z.string().regex(/^\d+\.\d{2}$/);
const timestamp = z.iso.datetime({ offset: true });
const section = <T extends z.ZodType>(data: T) => z.discriminatedUnion('status', [
  z.object({ status: z.literal('notAvailable') }), z.object({ status: z.literal('ready'), data }),
]);
export const dashboardSchema = z.object({
  period: z.object({ month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/), timeZone: z.literal('America/La_Paz'), start: timestamp, endExclusive: timestamp }),
  currency: z.literal('BOB'), asOf: timestamp,
  sections: z.object({
    balance: section(z.object({ amount: money, cutoff: timestamp })),
    monthlySummary: section(z.object({ income: money, expense: money })),
    expenseDistribution: section(z.array(z.object({ categoryId: z.uuid().nullable(), categoryName: z.string(), amount: money, percentage }))),
    budgets: section(z.array(z.object({ id: z.uuid(), categoryId: z.uuid(), categoryName: z.string(), limit: money, spent: money, remaining: money, progress: percentage, state: z.enum(['normal', 'warning', 'exceeded']) }))),
    savingsGoals: section(z.array(z.object({ id: z.uuid(), name: z.string(), target: money, saved: money, remaining: money, progress: percentage, state: z.enum(['active', 'completed', 'overdue']), targetDate: z.iso.date().nullable() }))),
  }),
});
export type Dashboard = z.infer<typeof dashboardSchema>;
export type DashboardSections = Dashboard['sections'];
