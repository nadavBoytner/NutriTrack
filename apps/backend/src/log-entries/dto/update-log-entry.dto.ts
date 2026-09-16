import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateLogEntryDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100_000)
  quantityG?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100_000)
  calories?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100_000)
  carbsG?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100_000)
  fatG?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100_000)
  proteinG?: number;
}
