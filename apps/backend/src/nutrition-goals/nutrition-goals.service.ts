import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateNutritionGoalDto } from './dto/update-nutrition-goal.dto.js';

@Injectable()
export class NutritionGoalsService {
  constructor(private readonly prisma: PrismaService) {}

  getGoal(userId: string) {
    return this.prisma.nutritionGoal.findUnique({ where: { userId } });
  }

  upsertGoal(userId: string, dto: UpdateNutritionGoalDto) {
    return this.prisma.nutritionGoal.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: { ...dto },
    });
  }
}
