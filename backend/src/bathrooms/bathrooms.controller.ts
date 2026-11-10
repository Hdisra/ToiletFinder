import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { BathroomsService } from './bathrooms.service.js';
import { CreateBathroomDto } from './dto/create-bathroom.dto.js';
import { CreateRatingDto } from './dto/create-rating.dto.js';
import { FindNearbyDto } from './dto/find-nearby.dto.js';

@Controller('bathrooms')
export class BathroomsController {
  constructor(private readonly bathrooms: BathroomsService) {}

  /** GET /api/bathrooms?lat=..&lng=..&radius=2000&includePaid=false */
  @Get()
  findNearby(@Query() query: FindNearbyDto) {
    return this.bathrooms.findNearby(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bathrooms.findOne(id);
  }

  /** The rating of the logged-in user. */
  @UseGuards(AuthGuard)
  @Get(':id/ratings/mine')
  findMyRating(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.bathrooms.findMyRating(id, user.id);
  }

  @Get(':id/ratings')
  findRatings(@Param('id', ParseIntPipe) id: number) {
    return this.bathrooms.findRatings(id);
  }

  /** Admin only. */
  @UseGuards(AuthGuard, AdminGuard)
  @Post()
  create(@Body() dto: CreateBathroomDto) {
    return this.bathrooms.create(dto);
  }

  /** Creates or updates the rating of the logged-in user. */
  @UseGuards(AuthGuard)
  @Put(':id/ratings/mine')
  saveMyRating(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateRatingDto,
  ) {
    return this.bathrooms.saveMyRating(id, user.id, dto);
  }
}
