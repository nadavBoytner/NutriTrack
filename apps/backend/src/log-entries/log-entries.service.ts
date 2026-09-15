import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateLogEntryDto } from './dto/create-log-entry.dto.js';
import { UpdateLogEntryDto } from './dto/update-log-entry.dto.js';

function scale(per100g: number, quantityG: number): number {
  return (per100g * quantityG) / 100;
}

@Injectable()
export class LogEntriesService {
  constructor(private readonly prisma: PrismaService) {}

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
        calories: dto.calories,
        carbsG: dto.carbsG,
        fatG: dto.fatG,
        proteinG: dto.proteinG,
        source: 'manual',
      },
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
