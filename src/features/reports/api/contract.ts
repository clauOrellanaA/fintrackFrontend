import { z } from 'zod';

const money = z.string().regex(/^-?\d{1,12}\.\d{2}$/);
const percentage = z.string().regex(/^\d+\.\d{2}$/);
const date = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/).refine(value => {
  const [year, month, day] = value.split('-').map(Number);
  const maximumDay = month === 2 ? year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28 : [4, 6, 9, 11].includes(month) ? 30 : 31;
  return day <= maximumDay;
});
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const timestamp = z.iso.datetime({ offset: true });

export const reportsSchema = z.object({
  period: z.object({ from: date, to: date, timeZone: z.literal('America/La_Paz'), start: timestamp, endExclusive: timestamp }).strict(),
  currency: z.literal('BOB'), asOf: timestamp,
  comparison: z.object({ income: money, expense: money, net: money }).strict(),
  expenseDistribution: z.array(z.object({ categoryId: z.uuid().nullable(), categoryName: z.string().min(1), amount: money, percentage }).strict()),
  balanceEvolution: z.array(z.object({ month, amount: money, cutoff: timestamp }).strict()),
}).strict();

export type ReportsResponse = z.infer<typeof reportsSchema>;
