import type { PrismaService } from '../prisma/prisma.service.js';
import type { WeightEntriesService } from '../weight-entries/weight-entries.service.js';
import { ReportsService } from './reports.service.js';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: {
    logEntry: { aggregate: ReturnType<typeof vi.fn> };
    nutritionGoal: { findUnique: ReturnType<typeof vi.fn> };
  };
  let weightEntriesService: { findInRange: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    prisma = {
      logEntry: { aggregate: vi.fn() },
      nutritionGoal: { findUnique: vi.fn() },
    };
    weightEntriesService = { findInRange: vi.fn() };
    service = new ReportsService(
      prisma as unknown as PrismaService,
      weightEntriesService as unknown as WeightEntriesService,
    );
  });

  it('scales the daily goal by the number of days in the period', async () => {
    prisma.logEntry.aggregate.mockResolvedValue({
      _sum: { calories: 1000, carbsG: 100, fatG: 40, proteinG: 60 },
    });
    prisma.nutritionGoal.findUnique.mockResolvedValue({
      dailyCalories: 2000,
      dailyCarbsG: 200,
      dailyFatG: 70,
      dailyProteinG: 150,
    });

    const report = await service.getMacroReport('user-1', 'weekly', '2026-09-15');

    expect(report.from).toBe('2026-09-14');
    expect(report.to).toBe('2026-09-20');
    expect(report.totals).toEqual({ calories: 1000, carbsG: 100, fatG: 40, proteinG: 60 });
    expect(report.goal).toEqual({ calories: 14000, carbsG: 1400, fatG: 490, proteinG: 1050 });
  });

  it('returns zeroed totals when there are no log entries', async () => {
    prisma.logEntry.aggregate.mockResolvedValue({ _sum: {} });
    prisma.nutritionGoal.findUnique.mockResolvedValue(null);

    const report = await service.getMacroReport('user-1', 'daily', '2026-09-15');

    expect(report.totals).toEqual({ calories: 0, carbsG: 0, fatG: 0, proteinG: 0 });
    expect(report.goal).toBeNull();
  });

  it('delegates the weight trend to WeightEntriesService', async () => {
    weightEntriesService.findInRange.mockResolvedValue([]);

    await service.getWeightTrend('user-1', '2026-09-01', '2026-09-15');

    expect(weightEntriesService.findInRange).toHaveBeenCalledWith('user-1', '2026-09-01', '2026-09-15');
  });
});
