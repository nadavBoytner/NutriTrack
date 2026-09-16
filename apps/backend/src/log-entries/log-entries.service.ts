import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FoodItemsService } from '../food-items/food-items.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiParseService } from './ai-parse.service.js';
import { CreateLogEntryDto } from './dto/create-log-entry.dto.js';
import { UpdateLogEntryDto } from './dto/update-log-entry.dto.js';

function scale(per100g: number, quantityG: number): number {
  return (per100g * quantityG) / 100;
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface DayHistory {
  date: string;
  totals: { calories: number; carbsG: number; fatG: number; proteinG: number };
  entryCount: number;
  weightKg: number | null;
}

export interface AiParsedItem {
  customName: string;
  foodItemId: string | null;
  quantityG: number;
  calories: number;
  carbsG: number;
  fatG: number;
  proteinG: number;
  source: 'db' | 'ai_estimated';
}

@Injectable()
export class LogEntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiParseService: AiParseService,
    private readonly foodItemsService: FoodItemsService,
  ) {}

  async create(userId: string, dto: CreateLogEntryDto) {
    if (dto.foodItemId) {
      const foodItem = await this.prisma.foodItem.findUnique({ where: { id: dto.foodItemId } });
      if (!foodItem) {
        throw new BadRequestException('Unknown foodItemId');
      }
      return this.prisma.logEntry.create({
        data: {
          userId,
          date: new Date(dto.date),
          foodItemId: foodItem.id,
          quantityG: dto.quantityG,
          calories: scale(foodItem.caloriesPer100g, dto.quantityG),
          carbsG: scale(foodItem.carbsPer100g, dto.quantityG),
          fatG: scale(foodItem.fatPer100g, dto.quantityG),
          proteinG: scale(foodItem.proteinPer100g, dto.quantityG),
          source: 'db',
        },
      });
    }

    if (
      !dto.customName ||
      dto.calories === undefined ||
      dto.carbsG === undefined ||
      dto.fatG === undefined ||
      dto.proteinG === undefined
    ) {
      throw new BadRequestException('A manual entry requires customName, calories, carbsG, fatG, and proteinG');
    }

    return this.prisma.logEntry.create({
      data: {
        userId,
        date: new Date(dto.date),
        customName: dto.customName,
        quantityG: dto.quantityG,
        quantityUnit: dto.quantityUnit ?? 'g',
        calories: dto.calories,
        carbsG: dto.carbsG,
        fatG: dto.fatG,
        proteinG: dto.proteinG,
        source: dto.source === 'ai_estimated' ? 'ai_estimated' : 'manual',
      },
    });
  }

  async aiParse(text: string): Promise<AiParsedItem[]> {
    const extracted = await this.aiParseService.extractItems(text);

    return Promise.all(
      extracted.map(async (item): Promise<AiParsedItem> => {
        const match = await this.foodItemsService
          .search(item.name)
          .then((results) => results[0])
          .catch(() => undefined);

        if (match) {
          return {
            customName: item.name,
            foodItemId: match.id,
            quantityG: item.quantityG,
            calories: scale(match.caloriesPer100g, item.quantityG),
            carbsG: scale(match.carbsPer100g, item.quantityG),
            fatG: scale(match.fatPer100g, item.quantityG),
            proteinG: scale(match.proteinPer100g, item.quantityG),
            source: 'db',
          };
        }

        return {
          customName: item.name,
          foodItemId: null,
          quantityG: item.quantityG,
          calories: item.estimatedCalories,
          carbsG: item.estimatedCarbsG,
          fatG: item.estimatedFatG,
          proteinG: item.estimatedProteinG,
          source: 'ai_estimated',
        };
      }),
    );
  }

  recentManualFoods(userId: string) {
    return this.prisma.logEntry.findMany({
      where: { userId, source: 'manual', customName: { not: null } },
      orderBy: { createdAt: 'desc' },
      distinct: ['customName'],
      take: 8,
    });
  }

  async getHistory(userId: string, cursor: string | undefined, limit: number): Promise<{
    days: DayHistory[];
    nextCursor: string | null;
  }> {
    const before = cursor ?? '9999-12-31';

    const dateRows = await this.prisma.$queryRaw<{ date: Date }[]>`
      SELECT date FROM (
        SELECT DISTINCT date FROM "LogEntry" WHERE "userId" = ${userId}
        UNION
        SELECT DISTINCT date FROM "WeightEntry" WHERE "userId" = ${userId}
      ) AS d
      WHERE date < ${before}::date
      ORDER BY date DESC
      LIMIT ${limit}
    `;

    if (dateRows.length === 0) {
      return { days: [], nextCursor: null };
    }

    const dates = dateRows.map((row) => row.date);

    const [grouped, weights] = await Promise.all([
      this.prisma.logEntry.groupBy({
        by: ['date'],
        where: { userId, date: { in: dates } },
        _sum: { calories: true, carbsG: true, fatG: true, proteinG: true },
        _count: { _all: true },
      }),
      this.prisma.weightEntry.findMany({ where: { userId, date: { in: dates } } }),
    ]);

    const totalsByDate = new Map(grouped.map((g) => [toDateOnly(g.date), g]));
    const weightByDate = new Map(weights.map((w) => [toDateOnly(w.date), w.weightKg]));

    const days = dates.map((date): DayHistory => {
      const key = toDateOnly(date);
      const g = totalsByDate.get(key);
      return {
        date: key,
        totals: {
          calories: g?._sum.calories ?? 0,
          carbsG: g?._sum.carbsG ?? 0,
          fatG: g?._sum.fatG ?? 0,
          proteinG: g?._sum.proteinG ?? 0,
        },
        entryCount: g?._count._all ?? 0,
        weightKg: weightByDate.get(key) ?? null,
      };
    });

    return {
      days,
      nextCursor: dates.length === limit ? toDateOnly(dates[dates.length - 1]) : null,
    };
  }

  findForDate(userId: string, date: string) {
    return this.prisma.logEntry.findMany({
      where: { userId, date: new Date(date) },
      orderBy: { id: 'asc' },
      include: { foodItem: { select: { name: true } } },
    });
  }

  async update(userId: string, id: string, dto: UpdateLogEntryDto) {
    const entry = await this.getOwned(userId, id);

    if (entry.foodItemId && dto.quantityG !== undefined) {
      const foodItem = await this.prisma.foodItem.findUniqueOrThrow({ where: { id: entry.foodItemId } });
      return this.prisma.logEntry.update({
        where: { id },
        data: {
          quantityG: dto.quantityG,
          calories: scale(foodItem.caloriesPer100g, dto.quantityG),
          carbsG: scale(foodItem.carbsPer100g, dto.quantityG),
          fatG: scale(foodItem.fatPer100g, dto.quantityG),
          proteinG: scale(foodItem.proteinPer100g, dto.quantityG),
        },
      });
    }

    return this.prisma.logEntry.update({
      where: { id },
      data: {
        quantityG: dto.quantityG,
        calories: dto.calories,
        carbsG: dto.carbsG,
        fatG: dto.fatG,
        proteinG: dto.proteinG,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.getOwned(userId, id);
    await this.prisma.logEntry.delete({ where: { id } });
  }

  private async getOwned(userId: string, id: string) {
    const entry = await this.prisma.logEntry.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Log entry not found');
    }
    if (entry.userId !== userId) {
      throw new ForbiddenException();
    }
    return entry;
  }
}
