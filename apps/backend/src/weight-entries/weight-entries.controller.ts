import { Body, Controller, Delete, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { RequestUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { QueryWeightEntriesDto } from './dto/query-weight-entries.dto.js';
import { UpsertWeightEntryDto } from './dto/upsert-weight-entry.dto.js';
import { WeightEntriesService } from './weight-entries.service.js';

@UseGuards(JwtAuthGuard)
@Controller('weight-entries')
export class WeightEntriesController {
  constructor(private readonly weightEntriesService: WeightEntriesService) {}

  @Put()
  upsert(@CurrentUser() user: RequestUser, @Body() dto: UpsertWeightEntryDto) {
    return this.weightEntriesService.upsert(user.userId, dto);
  }

  @Get()
  findInRange(@CurrentUser() user: RequestUser, @Query() query: QueryWeightEntriesDto) {
    return this.weightEntriesService.findInRange(user.userId, query.from, query.to);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.weightEntriesService.remove(user.userId, id);
  }
}
