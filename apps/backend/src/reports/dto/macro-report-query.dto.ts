import { IsDateString, IsIn } from 'class-validator';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export class MacroReportQueryDto {
  @IsIn(['daily', 'weekly', 'monthly'])
  period!: ReportPeriod;

  @IsDateString()
  date!: string;
}
