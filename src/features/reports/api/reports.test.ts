import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { reportsSchema } from './contract';
import { getReports } from './reports';
import { jsonResponse, reportsFixture } from '../test/fixtures';

beforeEach(() => vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3100/api/v1/'));
afterEach(() => vi.unstubAllGlobals());

describe('reports contract and transport', () => {
  it('preserves exact decimal strings, nullable category and Bolivia metadata', () => {
    const report = reportsFixture();
    expect(reportsSchema.parse(report)).toEqual(report);
    expect(report.comparison.income).toBe('123456789012.34');
    expect(report.expenseDistribution[0].categoryId).toBeNull();
  });

  it('sends a bearer-authenticated, non-cacheable request without a userId', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse(reportsFixture()));
    vi.stubGlobal('fetch', fetcher);

    await getReports('synthetic-token', '2026-01-01', '2026-02-28', new AbortController().signal);

    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3100/api/v1/reports?from=2026-01-01&to=2026-02-28',
      expect.objectContaining({
        headers: { Accept: 'application/json', Authorization: 'Bearer synthetic-token' },
        credentials: 'omit', cache: 'no-store',
      }),
    );
    expect(String(fetcher.mock.calls[0][0])).not.toContain('userId');
  });

  it.each([401, 400, 422, 500, 503])('classifies HTTP %i without manufacturing a report', async status => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: { code: 'SYNTHETIC' } }, status)));
    await expect(getReports('token', '2026-01-01', '2026-02-28', new AbortController().signal)).rejects.toMatchObject({
      status,
      kind: status === 401 ? 'unauthenticated' : status === 400 || status === 422 ? 'validation' : 'server',
    });
  });

  it('rejects an invalid payload or a response for a different requested period', async () => {
    const report = reportsFixture();
    const invalidCases: unknown[] = [
      {},
      { ...report, currency: 'USD' },
      { ...report, comparison: { ...report.comparison, income: 20 } },
      { ...report, period: { ...report.period, to: '2026-03-01' } },
    ];
    for (const body of invalidCases) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(body)));
      await expect(getReports('token', '2026-01-01', '2026-02-28', new AbortController().signal)).rejects.toMatchObject({ kind: 'invalid-response' });
    }
  });
});
