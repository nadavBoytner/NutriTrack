import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateLogEntryDto {
  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(0)
  quantityG!: number;

  @IsOptional()
  @IsUUID()
  foodItemId?: string;

  @IsOptional()
  @IsString()
  customName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  calories?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  carbsG?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fatG?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  proteinG?: number;
}
