import { IsDateString, IsIn, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateLogEntryDto {
  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(0)
  @Max(100_000)
  quantityG!: number;

  @IsOptional()
  @IsIn(['g', 'portion'])
  quantityUnit?: 'g' | 'portion';

  @IsOptional()
  @IsUUID()
  foodItemId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  customName?: string;

  @IsOptional()
  @IsIn(['manual', 'ai_estimated'])
  source?: 'manual' | 'ai_estimated';

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
