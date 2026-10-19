import { ApiError, requestJson } from '../../../shared/api/http';
import { dashboardSchema } from './contract';

export async function getDashboard(token: string, month: string, signal: AbortSignal) {
  const dashboard = await requestJson(`dashboard?month=${encodeURIComponent(month)}`, dashboardSchema, { token, signal });
  if (dashboard.period.month !== month || (dashboard.sections.balance.status === 'ready' && dashboard.sections.balance.data.cutoff !== dashboard.asOf)) {
    throw new ApiError('invalid-response');
  }
  return dashboard;
}
