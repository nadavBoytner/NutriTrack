import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { WeightEntriesController } from './weight-entries.controller.js';
import { WeightEntriesService } from './weight-entries.service.js';

@Module({
  imports: [AuthModule],
  controllers: [WeightEntriesController],
  providers: [WeightEntriesService],
  exports: [WeightEntriesService],
})
export class WeightEntriesModule {}
