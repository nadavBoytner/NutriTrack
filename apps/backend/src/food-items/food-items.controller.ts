import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SearchFoodItemsDto } from './dto/search-food-items.dto.js';
import { FoodItemsService } from './food-items.service.js';

@UseGuards(JwtAuthGuard)
@Controller('food-items')
export class FoodItemsController {
  constructor(private readonly foodItemsService: FoodItemsService) {}

  @Get('search')
  search(@Query() query: SearchFoodItemsDto) {
    return this.foodItemsService.search(query.q);
  }
}
