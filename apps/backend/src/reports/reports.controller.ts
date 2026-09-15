import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { RequestUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { QueryWeightEntriesDto } from '../weight-entries/dto/query-weight-entries.dto.js';
import { MacroReportQueryDto } from './dto/macro-report-query.dto.js';
import { ReportsService } from './reports.service.js';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('macros')
  getMacroReport(@CurrentUser() user: RequestUser, @Query() query: MacroReportQueryDto) {
    return this.reportsService.getMacroReport(user.userId, query.period, query.date);
  }

  @Get('weight-trend')
  getWeightTrend(@CurrentUser() user: RequestUser, @Query() query: QueryWeightEntriesDto) {
    return this.reportsService.getWeightTrend(user.userId, query.from, query.to);
  }
}
