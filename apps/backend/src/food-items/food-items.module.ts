import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { FoodItemsController } from './food-items.controller.js';
import { FoodItemsService } from './food-items.service.js';

@Module({
  imports: [AuthModule],
  controllers: [FoodItemsController],
  providers: [FoodItemsService],
  exports: [FoodItemsService],
})
export class FoodItemsModule {}
