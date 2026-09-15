import type { ReportPeriod } from './dto/macro-report-query.dto.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Inclusive UTC date-only range for a report period, anchored on `date`. */
export function getPeriodRange(period: ReportPeriod, date: Date): { from: Date; to: Date } {
  if (period === 'daily') {
    return { from: date, to: date };
  }

  if (period === 'weekly') {
    const daysSinceMonday = (date.getUTCDay() + 6) % 7;
    const from = new Date(date.getTime() - daysSinceMonday * MS_PER_DAY);
    const to = new Date(from.getTime() + 6 * MS_PER_DAY);
    return { from, to };
  }

  const from = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const to = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
  return { from, to };
}

export function daysInRange(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY) + 1;
}
