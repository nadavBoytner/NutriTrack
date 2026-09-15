import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { FoodItemsModule } from './food-items/food-items.module.js';
import { LogEntriesModule } from './log-entries/log-entries.module.js';
import { NutritionGoalsModule } from './nutrition-goals/nutrition-goals.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProfileModule } from './profile/profile.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    NutritionGoalsModule,
    FoodItemsModule,
    LogEntriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
