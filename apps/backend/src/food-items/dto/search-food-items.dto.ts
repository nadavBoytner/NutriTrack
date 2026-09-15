import { IsString, MinLength } from 'class-validator';

export class SearchFoodItemsDto {
  @IsString()
  @MinLength(2)
  q!: string;
}
