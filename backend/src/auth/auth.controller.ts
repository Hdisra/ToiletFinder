import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';
import type { AuthUser } from './auth-user.js';
import { CurrentUser } from './current-user.decorator.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';

// Stricter than the global limit: these routes can be used to guess passwords or codes.
const STRICT = { default: { limit: 10, ttl: 60_000 } };

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Throttle(STRICT)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Throttle(STRICT)
  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  @Throttle(STRICT)
  @HttpCode(204)
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }

  @Throttle(STRICT)
  @HttpCode(204)
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }
}
