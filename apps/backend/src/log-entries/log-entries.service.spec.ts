import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { AiParseService, ExtractedItem } from './ai-parse.service.js';
import type { FoodItemsService } from '../food-items/food-items.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { LogEntriesService } from './log-entries.service.js';

describe('LogEntriesService', () => {
  let service: LogEntriesService;
  let prisma: {
    foodItem: { findUnique: ReturnType<typeof vi.fn>; findUniqueOrThrow: ReturnType<typeof vi.fn> };
    logEntry: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };
  let aiParseService: { extractItems: ReturnType<typeof vi.fn> };
  let foodItemsService: { search: ReturnType<typeof vi.fn> };

  const foodItem = {
    id: 'food-1',
    caloriesPer100g: 200,
    carbsPer100g: 20,
    fatPer100g: 10,
    proteinPer100g: 5,
  };

  beforeEach(() => {
    prisma = {
      foodItem: { findUnique: vi.fn(), findUniqueOrThrow: vi.fn() },
      logEntry: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    };
    aiParseService = { extractItems: vi.fn() };
    foodItemsService = { search: vi.fn() };
    service = new LogEntriesService(
      prisma as unknown as PrismaService,
      aiParseService as unknown as AiParseService,
      foodItemsService as unknown as FoodItemsService,
    );
  });

  it('scales macros from a food item by quantityG', async () => {
    prisma.foodItem.findUnique.mockResolvedValue(foodItem);
    prisma.logEntry.create.mockImplementation(({ data }) => Promise.resolve(data));

    const result = await service.create('user-1', { date: '2026-09-15', foodItemId: 'food-1', quantityG: 150 });

    expect(result).toMatchObject({
      calories: 300,
      carbsG: 30,
      fatG: 15,
      proteinG: 7.5,
      source: 'db',
    });
  });

  it('stores the absolute values provided for a manual entry unscaled', async () => {
    prisma.logEntry.create.mockImplementation(({ data }) => Promise.resolve(data));

    const result = await service.create('user-1', {
      date: '2026-09-15',
      quantityG: 250,
      customName: 'Homemade soup',
      calories: 180,
      carbsG: 22,
      fatG: 6,
      proteinG: 8,
    });

    expect(result).toMatchObject({
      calories: 180,
      carbsG: 22,
      fatG: 6,
      proteinG: 8,
      source: 'manual',
      quantityUnit: 'g',
    });
  });

  it('stores the given quantityUnit for a manual entry', async () => {
    prisma.logEntry.create.mockImplementation(({ data }) => Promise.resolve(data));

    const result = await service.create('user-1', {
      date: '2026-09-15',
      quantityG: 2,
      quantityUnit: 'portion',
      customName: 'Protein bar',
      calories: 400,
      carbsG: 40,
      fatG: 16,
      proteinG: 20,
    });

    expect(result).toMatchObject({ quantityUnit: 'portion' });
  });

  it('tags a manual entry created from a confirmed AI-estimated item', async () => {
    prisma.logEntry.create.mockImplementation(({ data }) => Promise.resolve(data));

    const result = await service.create('user-1', {
      date: '2026-09-15',
      quantityG: 150,
      customName: 'Grandma’s soup',
      source: 'ai_estimated',
      calories: 120,
      carbsG: 10,
      fatG: 4,
      proteinG: 6,
    });

    expect(result).toMatchObject({ source: 'ai_estimated' });
  });

  it('rejects a manual entry missing required macro fields', async () => {
    await expect(
      service.create('user-1', { date: '2026-09-15', quantityG: 100, customName: 'Mystery snack' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an unknown foodItemId', async () => {
    prisma.foodItem.findUnique.mockResolvedValue(null);

    await expect(
      service.create('user-1', { date: '2026-09-15', foodItemId: 'missing', quantityG: 100 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects updating an entry owned by another user', async () => {
    prisma.logEntry.findUnique.mockResolvedValue({ id: 'entry-1', userId: 'someone-else', foodItemId: null });

    await expect(service.update('user-1', 'entry-1', { quantityG: 100 })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('rejects operating on a missing entry', async () => {
    prisma.logEntry.findUnique.mockResolvedValue(null);

    await expect(service.remove('user-1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('queries the most recent distinct manual entries by name', async () => {
    prisma.logEntry.findMany.mockResolvedValue([]);

    await service.recentManualFoods('user-1');

    expect(prisma.logEntry.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', source: 'manual', customName: { not: null } },
      orderBy: { createdAt: 'desc' },
      distinct: ['customName'],
      take: 8,
    });
  });

  describe('aiParse', () => {
    const extracted: ExtractedItem[] = [
      {
        name: 'rice',
        quantityG: 150,
        estimatedCalories: 195,
        estimatedCarbsG: 42,
        estimatedFatG: 0.4,
        estimatedProteinG: 4,
      },
    ];

    it('scales macros from a matched food item and tags the source db', async () => {
      aiParseService.extractItems.mockResolvedValue(extracted);
      foodItemsService.search.mockResolvedValue([foodItem]);

      const [result] = await service.aiParse('a cup of rice');

      expect(result).toMatchObject({
        customName: 'rice',
        foodItemId: 'food-1',
        quantityG: 150,
        calories: 300,
        carbsG: 30,
        fatG: 15,
        proteinG: 7.5,
        source: 'db',
      });
    });

    it('falls back to the AI estimate when no food item matches', async () => {
      aiParseService.extractItems.mockResolvedValue(extracted);
      foodItemsService.search.mockResolvedValue([]);

      const [result] = await service.aiParse('a cup of rice');

      expect(result).toMatchObject({
        customName: 'rice',
        foodItemId: null,
        calories: 195,
        carbsG: 42,
        fatG: 0.4,
        proteinG: 4,
        source: 'ai_estimated',
      });
    });

    it('falls back to the AI estimate when the food search fails', async () => {
      aiParseService.extractItems.mockResolvedValue(extracted);
      foodItemsService.search.mockRejectedValue(new Error('Open Food Facts is down'));

      const [result] = await service.aiParse('a cup of rice');

      expect(result.source).toBe('ai_estimated');
    });
  });
});
