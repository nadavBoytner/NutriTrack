import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
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
    service = new LogEntriesService(prisma as unknown as PrismaService);
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
    });
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
});
