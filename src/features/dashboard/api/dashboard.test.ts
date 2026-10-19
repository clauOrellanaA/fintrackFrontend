import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import contract from '../../../../docs/contracts/dashboard.v1.json';
import { ApiError } from '../../../shared/api/http';
import { dashboardFixture, jsonResponse } from '../../../test/fixtures';
import { currentMonth } from '../lib/period';
import { dashboardSchema } from './contract';
import { getDashboard } from './dashboard';

beforeEach(() => vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3100/api/v1/'));
afterEach(() => vi.useRealTimers());
describe('dashboard contract and transport', () => {
  it('accepts every versioned backend example without coercing exact amounts', () => {
    for (const example of Object.values(contract.paths['/dashboard'].get.responses['200'].content['application/json'].examples)) expect(dashboardSchema.safeParse(example.value).success).toBe(true);
    const fixture = dashboardFixture();
    fixture.sections.balance = { status: 'ready', data: { amount: '999999999999.99', cutoff: fixture.asOf } };
    expect(dashboardSchema.parse(fixture).sections.balance).toEqual(fixture.sections.balance);
  });
  it('sends the session as bearer and the period without a client userId', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse(dashboardFixture()));
    vi.stubGlobal('fetch', fetcher);
    await getDashboard('secret-token', '2026-10', new AbortController().signal);
    expect(fetcher).toHaveBeenCalledWith('http://localhost:3100/api/v1/dashboard?month=2026-10', expect.objectContaining({ headers: { Accept: 'application/json', Authorization: 'Bearer secret-token' }, credentials: 'omit', cache: 'no-store' }));
  });
  it.each([401, 400, 503])('distinguishes HTTP %i without returning zeros', async status => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: { code: 'FAIL', message: 'private' } }, status)));
    await expect(getDashboard('token', '2026-10', new AbortController().signal)).rejects.toMatchObject({ kind: status === 401 ? 'unauthenticated' : status === 400 ? 'validation' : 'server', status });
  });
  it('rejects missing sections, numeric money, mismatched month and cutoff', async () => {
    const wrongMoney = dashboardFixture();
    const cases: unknown[] = [{}, { ...wrongMoney, sections: { ...wrongMoney.sections, balance: { status: 'ready', data: { amount: 123, cutoff: wrongMoney.asOf } } } }, dashboardFixture('2026-11'), { ...wrongMoney, asOf: '2026-10-20T00:00:00.000Z' }];
    for (const value of cases) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(value)));
      await expect(getDashboard('token', '2026-10', new AbortController().signal)).rejects.toMatchObject({ kind: 'invalid-response' });
    }
  });
  it('preserves unavailable sections instead of inventing zero data', async () => {
    const fixture = dashboardFixture(); fixture.sections.balance = { status: 'notAvailable' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(fixture)));
    expect((await getDashboard('token', '2026-10', new AbortController().signal)).sections.balance).toEqual({ status: 'notAvailable' });
  });
  it('distinguishes caller cancellation and an expired network timeout', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_url: string, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    })));
    const controller = new AbortController();
    const aborted = getDashboard('token', '2026-10', controller.signal).catch(error => error);
    controller.abort(); expect(await aborted).toMatchObject({ name: 'AbortError' });
    const timeout = getDashboard('token', '2026-10', new AbortController().signal).catch(error => error);
    await vi.advanceTimersByTimeAsync(10001);
    expect(await timeout).toBeInstanceOf(ApiError); expect(await timeout).toMatchObject({ kind: 'timeout' });
  });
  it('selects current month in Bolivia at a UTC month boundary', () => {
    expect(currentMonth(new Date('2026-11-01T02:00:00Z'))).toBe('2026-10');
  });
});
