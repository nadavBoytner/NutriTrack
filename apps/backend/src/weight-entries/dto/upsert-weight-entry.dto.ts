import { IsDateString, IsNumber, Max, Min } from 'class-validator';

export class UpsertWeightEntryDto {
  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(0)
  @Max(500)
  weightKg!: number;
}
