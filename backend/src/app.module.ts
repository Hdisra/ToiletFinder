import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AdminModule } from './admin/admin.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BathroomsModule } from './bathrooms/bathrooms.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const synchronize = config.get<string>('DB_SYNCHRONIZE') === 'true';
        if (synchronize && process.env.NODE_ENV === 'production') {
          throw new Error(
            'DB_SYNCHRONIZE=true is not allowed in production: it can alter or drop tables. Use migrations.',
          );
        }
        return {
          type: 'mysql',
          host: config.getOrThrow<string>('DB_HOST'),
          port: Number(config.getOrThrow<string>('DB_PORT')),
          username: config.getOrThrow<string>('DB_USER'),
          password: config.getOrThrow<string>('DB_PASSWORD'),
          database: config.getOrThrow<string>('DB_NAME'),
          autoLoadEntities: true,
          // MySQL stores timestamps in UTC (its default in Docker). Without this the
          // driver reads them as the server's local time and every date is shifted.
          timezone: 'Z',
          // Development only: creates/updates tables from the entities.
          // Replace with migrations before going to production.
          synchronize,
        };
      },
    }),
    // Default limit per IP; the auth routes have a stricter one.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    AuthModule,
    BathroomsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
