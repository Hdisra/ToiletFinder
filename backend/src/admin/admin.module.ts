import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { Bathroom } from '../bathrooms/bathroom.entity.js';
import { BathroomsModule } from '../bathrooms/bathrooms.module.js';
import { Rating } from '../bathrooms/rating.entity.js';
import { User } from '../users/user.entity.js';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bathroom, Rating, User]),
    AuthModule,
    BathroomsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
