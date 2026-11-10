import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { Bathroom } from './bathroom.entity.js';
import { BathroomsController } from './bathrooms.controller.js';
import { BathroomsService } from './bathrooms.service.js';
import { Rating } from './rating.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Bathroom, Rating]), AuthModule],
  controllers: [BathroomsController],
  providers: [BathroomsService],
  exports: [BathroomsService],
})
export class BathroomsModule {}
