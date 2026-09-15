import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { RequestUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AiParseDto } from './dto/ai-parse.dto.js';
import { CreateLogEntryDto } from './dto/create-log-entry.dto.js';
import { QueryLogEntriesDto } from './dto/query-log-entries.dto.js';
import { UpdateLogEntryDto } from './dto/update-log-entry.dto.js';
import { LogEntriesService } from './log-entries.service.js';

@UseGuards(JwtAuthGuard)
@Controller('log-entries')
export class LogEntriesController {
  constructor(private readonly logEntriesService: LogEntriesService) {}

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateLogEntryDto) {
    return this.logEntriesService.create(user.userId, dto);
  }

  @Get()
  findForDate(@CurrentUser() user: RequestUser, @Query() query: QueryLogEntriesDto) {
    return this.logEntriesService.findForDate(user.userId, query.date);
  }

  @Get('recent-manual')
  recentManual(@CurrentUser() user: RequestUser) {
    return this.logEntriesService.recentManualFoods(user.userId);
  }

  @Post('ai-parse')
  aiParse(@Body() dto: AiParseDto) {
    return this.logEntriesService.aiParse(dto.text);
  }

  @Put(':id')
  update(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateLogEntryDto) {
    return this.logEntriesService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.logEntriesService.remove(user.userId, id);
  }
}
