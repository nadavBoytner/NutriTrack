import { IsInt, Max, Min } from 'class-validator';

export class UpdateNutritionGoalDto {
  @IsInt()
  @Min(0)
  @Max(20_000)
  dailyCalories!: number;

  @IsInt()
  @Min(0)
  @Max(2_000)
  dailyCarbsG!: number;

  @IsInt()
  @Min(0)
  @Max(2_000)
  dailyFatG!: number;

  @IsInt()
  @Min(0)
  @Max(2_000)
  dailyProteinG!: number;
}
