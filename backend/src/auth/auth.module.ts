import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module.js';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { assertStrongSecret } from './jwt-secret.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { PasswordResetToken } from './password-reset-token.entity.js';

@Module({
  imports: [
    UsersModule,
    MailModule,
    TypeOrmModule.forFeature([PasswordResetToken]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: assertStrongSecret(config.getOrThrow<string>('JWT_SECRET')),
        // Sign and accept only HS256, so a token can't pick a weaker algorithm (like "none").
        signOptions: {
          algorithm: 'HS256',
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '30d') as '30d',
        },
        verifyOptions: { algorithms: ['HS256'] },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  // Exported so other modules can use `@UseGuards(AuthGuard)`.
  exports: [AuthGuard, JwtModule, UsersModule],
})
export class AuthModule {}
