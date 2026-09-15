import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service.js';
import { WeightEntriesService } from './weight-entries.service.js';

describe('WeightEntriesService', () => {
  let service: WeightEntriesService;
  let prisma: {
    weightEntry: {
      upsert: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      weightEntry: { upsert: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
    };
    service = new WeightEntriesService(prisma as unknown as PrismaService);
  });

  it('upserts a weight entry keyed by userId and date', async () => {
    prisma.weightEntry.upsert.mockResolvedValue({ id: 'w-1', userId: 'user-1', weightKg: 80 });

    await service.upsert('user-1', { date: '2026-09-15', weightKg: 80 });

    expect(prisma.weightEntry.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_date: { userId: 'user-1', date: new Date('2026-09-15') } },
      }),
    );
  });

  it('lists entries within a date range ordered by date', async () => {
    prisma.weightEntry.findMany.mockResolvedValue([]);

    await service.findInRange('user-1', '2026-09-01', '2026-09-15');

    expect(prisma.weightEntry.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', date: { gte: new Date('2026-09-01'), lte: new Date('2026-09-15') } },
      orderBy: { date: 'asc' },
    });
  });

  it('rejects removing an entry owned by another user', async () => {
    prisma.weightEntry.findUnique.mockResolvedValue({ id: 'w-1', userId: 'someone-else' });

    await expect(service.remove('user-1', 'w-1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects removing a missing entry', async () => {
    prisma.weightEntry.findUnique.mockResolvedValue(null);

    await expect(service.remove('user-1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
