import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateLogEntryDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantityG?: number;

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
