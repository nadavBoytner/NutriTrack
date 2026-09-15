import { IsDateString } from 'class-validator';

export class QueryWeightEntriesDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}
