import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { AdminService } from './admin.service.js';
import { PageQueryDto } from './dto/page-query.dto.js';
import { StatsQueryDto } from './dto/stats-query.dto.js';
import { UpdateBathroomDto } from './dto/update-bathroom.dto.js';
import { UpdateRatingDto } from './dto/update-rating.dto.js';

/** Everything the admin web app needs. Creating bathrooms uses `POST /api/bathrooms`. */
@UseGuards(AuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('stats')
  stats(@Query() query: StatsQueryDto) {
    return this.admin.stats(query.tzOffset);
  }

  @Get('bathrooms')
  listBathrooms(@Query() query: PageQueryDto) {
    return this.admin.listBathrooms(query);
  }

  @Patch('bathrooms/:id')
  updateBathroom(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBathroomDto,
  ) {
    return this.admin.updateBathroom(id, dto);
  }

  @HttpCode(204)
  @Delete('bathrooms/:id')
  deleteBathroom(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteBathroom(id);
  }

  @Get('ratings')
  listRatings(@Query() query: PageQueryDto) {
    return this.admin.listRatings(query);
  }

  @Patch('ratings/:id')
  updateRating(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRatingDto,
  ) {
    return this.admin.updateRating(id, dto);
  }

  @HttpCode(204)
  @Delete('ratings/:id')
  deleteRating(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteRating(id);
  }
}
