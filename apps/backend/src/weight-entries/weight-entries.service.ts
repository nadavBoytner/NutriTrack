import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpsertWeightEntryDto } from './dto/upsert-weight-entry.dto.js';

@Injectable()
export class WeightEntriesService {
  constructor(private readonly prisma: PrismaService) {}

  upsert(userId: string, dto: UpsertWeightEntryDto) {
    const date = new Date(dto.date);
    return this.prisma.weightEntry.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, weightKg: dto.weightKg },
      update: { weightKg: dto.weightKg },
    });
  }

  findInRange(userId: string, from: string, to: string) {
    return this.prisma.weightEntry.findMany({
      where: { userId, date: { gte: new Date(from), lte: new Date(to) } },
      orderBy: { date: 'asc' },
    });
  }

  async remove(userId: string, id: string) {
    const entry = await this.prisma.weightEntry.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Weight entry not found');
    }
    if (entry.userId !== userId) {
      throw new ForbiddenException();
    }
    await this.prisma.weightEntry.delete({ where: { id } });
  }
}
