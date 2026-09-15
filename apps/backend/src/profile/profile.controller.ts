import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { RequestUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ProfileService } from './profile.service.js';

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  get(@CurrentUser() user: RequestUser) {
    return this.profileService.getProfile(user.userId);
  }

  @Put()
  update(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfileDto) {
    return this.profileService.upsertProfile(user.userId, dto);
  }
}
