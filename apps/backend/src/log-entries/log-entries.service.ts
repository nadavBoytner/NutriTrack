import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FoodItemsService } from '../food-items/food-items.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiParseService } from './ai-parse.service.js';
import { CreateLogEntryDto } from './dto/create-log-entry.dto.js';
import { UpdateLogEntryDto } from './dto/update-log-entry.dto.js';

function scale(per100g: number, quantityG: number): number {
  return (per100g * quantityG) / 100;
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
