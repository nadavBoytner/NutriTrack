import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { LogEntriesController } from './log-entries.controller.js';
import { LogEntriesService } from './log-entries.service.js';

@Module({
  imports: [AuthModule],
  controllers: [LogEntriesController],
  providers: [LogEntriesService],
})
export class LogEntriesModule {}
