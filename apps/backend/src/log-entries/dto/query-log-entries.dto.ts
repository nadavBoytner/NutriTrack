import { IsDateString } from 'class-validator';

export class QueryLogEntriesDto {
  @IsDateString()
  date!: string;
}
