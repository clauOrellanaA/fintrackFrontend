import { describe, expect, it } from 'vitest';
import { defaultReportPeriod, inclusiveCalendarMonths, isCalendarDate } from './period';

describe('report period validation helpers', () => {
  it('recognizes real calendar dates including leap years', () => {
    expect(isCalendarDate('2024-02-29')).toBe(true);
    expect(isCalendarDate('2026-02-29')).toBe(false);
    expect(isCalendarDate('2026-04-31')).toBe(false);
  });

  it('counts calendar months inclusively for the 24-month selector limit', () => {
    expect(inclusiveCalendarMonths('2024-01-31', '2025-12-01')).toBe(24);
    expect(inclusiveCalendarMonths('2024-01-01', '2026-01-01')).toBe(25);
  });

  it('uses the Bolivia calendar date at a UTC boundary for the default period', () => {
    expect(defaultReportPeriod(new Date('2026-11-01T02:00:00.000Z'))).toEqual({ from: '2025-11-01', to: '2026-10-31' });
  });
});
