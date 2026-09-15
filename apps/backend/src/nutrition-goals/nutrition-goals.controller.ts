import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { RequestUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UpdateNutritionGoalDto } from './dto/update-nutrition-goal.dto.js';
import { NutritionGoalsService } from './nutrition-goals.service.js';

@UseGuards(JwtAuthGuard)
@Controller('nutrition-goals')
export class NutritionGoalsController {
  constructor(private readonly nutritionGoalsService: NutritionGoalsService) {}

  @Get()
  get(@CurrentUser() user: RequestUser) {
    return this.nutritionGoalsService.getGoal(user.userId);
  }

  @Put()
  update(@CurrentUser() user: RequestUser, @Body() dto: UpdateNutritionGoalDto) {
    return this.nutritionGoalsService.upsertGoal(user.userId, dto);
  }
}
