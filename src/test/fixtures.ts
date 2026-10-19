import contract from '../../docs/contracts/dashboard.v1.json';
import { dashboardSchema, type Dashboard } from '../features/dashboard/api/contract';

export function dashboardFixture(month = '2026-10'): Dashboard {
  const fixture = dashboardSchema.parse(structuredClone(contract.paths['/dashboard'].get.responses['200'].content['application/json'].examples.be06.value));
  fixture.period.month = month;
  fixture.period.start = `${month}-01T04:00:00.000Z`;
  const [year, number] = month.split('-').map(Number);
  fixture.period.endExclusive = new Date(Date.UTC(year, number, 1, 4)).toISOString();
  return fixture;
}
export function jsonResponse(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
}
export function sessionResponse(token = 'a'.repeat(43)) {
  return jsonResponse({ accessToken: token, tokenType: 'Bearer', expiresAt: new Date(Date.now() + 3600000).toISOString() });
}
export function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}
