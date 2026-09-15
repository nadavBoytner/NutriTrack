import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { FoodItemsModule } from '../food-items/food-items.module.js';
import { AiParseService } from './ai-parse.service.js';
import { LogEntriesController } from './log-entries.controller.js';
import { LogEntriesService } from './log-entries.service.js';

@Module({
  imports: [AuthModule, FoodItemsModule],
  controllers: [LogEntriesController],
  providers: [LogEntriesService, AiParseService],
})
export class LogEntriesModule {}
