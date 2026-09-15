import { IsInt, Min } from 'class-validator';

export class UpdateNutritionGoalDto {
  @IsInt()
  @Min(0)
  dailyCalories!: number;

  @IsInt()
  @Min(0)
  dailyCarbsG!: number;

  @IsInt()
  @Min(0)
  dailyFatG!: number;

  @IsInt()
  @Min(0)
  dailyProteinG!: number;
}
