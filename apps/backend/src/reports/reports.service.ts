import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { WeightEntriesService } from '../weight-entries/weight-entries.service.js';
import type { ReportPeriod } from './dto/macro-report-query.dto.js';
import { daysInRange, getPeriodRange } from './period-range.js';

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly weightEntriesService: WeightEntriesService,
  ) {}

  async getMacroReport(userId: string, period: ReportPeriod, dateStr: string) {
    const { from, to } = getPeriodRange(period, new Date(dateStr));
    const days = daysInRange(from, to);

    const [aggregate, goal] = await Promise.all([
      this.prisma.logEntry.aggregate({
        where: { userId, date: { gte: from, lte: to } },
        _sum: { calories: true, carbsG: true, fatG: true, proteinG: true },
      }),
      this.prisma.nutritionGoal.findUnique({ where: { userId } }),
    ]);

    return {
      period,
      from: toDateOnly(from),
      to: toDateOnly(to),
      totals: {
        calories: aggregate._sum.calories ?? 0,
        carbsG: aggregate._sum.carbsG ?? 0,
        fatG: aggregate._sum.fatG ?? 0,
        proteinG: aggregate._sum.proteinG ?? 0,
      },
      goal: goal
        ? {
            calories: goal.dailyCalories * days,
            carbsG: goal.dailyCarbsG * days,
            fatG: goal.dailyFatG * days,
            proteinG: goal.dailyProteinG * days,
          }
        : null,
    };
  }

  getWeightTrend(userId: string, from: string, to: string) {
    return this.weightEntriesService.findInRange(userId, from, to);
  }
}
