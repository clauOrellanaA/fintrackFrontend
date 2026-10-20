import { reportsSchema, type ReportsResponse } from '../api/contract';

/** Datos sintéticos para tests controlados; no acreditan una integración real con la API. */
export function reportsFixture(overrides: Partial<ReportsResponse> = {}): ReportsResponse {
  return reportsSchema.parse({
    period: {
      from: '2026-01-01', to: '2026-02-28', timeZone: 'America/La_Paz',
      start: '2026-01-01T04:00:00.000Z', endExclusive: '2026-03-01T04:00:00.000Z',
    },
    currency: 'BOB', asOf: '2026-03-01T03:59:59.000Z',
    comparison: { income: '123456789012.34', expense: '230.10', net: '123456788782.24' },
    expenseDistribution: [{ categoryId: null, categoryName: 'Sin categor\u00eda', amount: '230.10', percentage: '100.00' }],
    balanceEvolution: [
      { month: '2026-01', amount: '20.00', cutoff: '2026-02-01T03:59:59.000Z' },
      { month: '2026-02', amount: '123456788782.24', cutoff: '2026-03-01T03:59:59.000Z' },
    ],
    ...overrides,
  });
}

export function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
}

export function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}
