import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { FoodItemsModule } from './food-items/food-items.module.js';
import { LogEntriesModule } from './log-entries/log-entries.module.js';
import { NutritionGoalsModule } from './nutrition-goals/nutrition-goals.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { WeightEntriesModule } from './weight-entries/weight-entries.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    ProfileModule,
    NutritionGoalsModule,
    FoodItemsModule,
    LogEntriesModule,
    WeightEntriesModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
