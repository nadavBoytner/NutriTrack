import { daysInRange, getPeriodRange } from './period-range.js';

describe('getPeriodRange', () => {
  it('daily returns the same single date', () => {
    const date = new Date('2026-09-15');
    expect(getPeriodRange('daily', date)).toEqual({ from: date, to: date });
  });

  it('weekly returns the Monday-Sunday range containing the date', () => {
    // 2026-09-15 is a Tuesday
    const { from, to } = getPeriodRange('weekly', new Date('2026-09-15'));
    expect(from.toISOString().slice(0, 10)).toBe('2026-09-14');
    expect(to.toISOString().slice(0, 10)).toBe('2026-09-20');
  });

  it('weekly anchored on a Monday starts on that same day', () => {
    const { from, to } = getPeriodRange('weekly', new Date('2026-09-14'));
    expect(from.toISOString().slice(0, 10)).toBe('2026-09-14');
    expect(to.toISOString().slice(0, 10)).toBe('2026-09-20');
  });

  it('monthly returns the first and last day of the month', () => {
    const { from, to } = getPeriodRange('monthly', new Date('2026-09-15'));
    expect(from.toISOString().slice(0, 10)).toBe('2026-09-01');
    expect(to.toISOString().slice(0, 10)).toBe('2026-09-30');
  });

  it('monthly handles February correctly', () => {
    const { from, to } = getPeriodRange('monthly', new Date('2028-02-10'));
    expect(from.toISOString().slice(0, 10)).toBe('2028-02-01');
    expect(to.toISOString().slice(0, 10)).toBe('2028-02-29');
  });
});

describe('daysInRange', () => {
  it('counts a single day as 1', () => {
    const date = new Date('2026-09-15');
    expect(daysInRange(date, date)).toBe(1);
  });

  it('counts a full week as 7', () => {
    expect(daysInRange(new Date('2026-09-14'), new Date('2026-09-20'))).toBe(7);
  });
});
