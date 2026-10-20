import { ApiError, requestJson } from '../../../shared/api/http';
import { reportsSchema, type ReportsResponse } from './contract';

export async function getReports(token: string, from: string, to: string, signal: AbortSignal): Promise<ReportsResponse> {
  const reports = await requestJson(`reports?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, reportsSchema, { token, signal });
  if (reports.period.from !== from || reports.period.to !== to) throw new ApiError('invalid-response');
  return reports;
}
