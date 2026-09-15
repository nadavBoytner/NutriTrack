import { IsDateString, IsNumber, Min } from 'class-validator';

export class UpsertWeightEntryDto {
  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(0)
  weightKg!: number;
}
