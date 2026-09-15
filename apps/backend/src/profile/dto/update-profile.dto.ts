import { IsIn, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weightKg?: number;

  @IsOptional()
  @IsIn(['cutting', 'bulking', 'maintain'])
  goalType?: 'cutting' | 'bulking' | 'maintain';
}
