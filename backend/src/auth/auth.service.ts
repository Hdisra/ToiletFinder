import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { QueryFailedError, Repository } from 'typeorm';
import { MailService } from '../mail/mail.service.js';
import { User } from '../users/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { hashPassword, verifyPassword } from './password.js';
import { PasswordResetToken } from './password-reset-token.entity.js';

const RESET_CODE_VALID_MINUTES = 15;
const RESET_CODE_MAX_ATTEMPTS = 5;
// Minimum time between two codes for the same account (see forgotPassword).
const RESET_CODE_COOLDOWN_SECONDS = 60;

// Checked when the email is unknown, so both failures take the same time.
const TIMING_EQUALIZER_HASH = await hashPassword('timing-equalizer');

const emailTaken = () =>
  new ConflictException({
    statusCode: 409,
    error: 'Conflict',
    code: 'EMAIL_TAKEN',
    message: 'An account with this email already exists',
  });

const invalidCode = () =>
  new BadRequestException({
    statusCode: 400,
    error: 'Bad Request',
    code: 'INVALID_CODE',
    message: 'The code is invalid or expired',
  });

const isDuplicateEntry = (error: unknown) =>
  error instanceof QueryFailedError &&
  (error.driverError as { code?: string } | undefined)?.code === 'ER_DUP_ENTRY';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokens: Repository<PasswordResetToken>,
  ) {}

  async register({ email, password }: RegisterDto) {
    if (await this.users.findByEmail(email)) throw emailTaken();
    try {
      return await this.session(
        await this.users.create(email, await hashPassword(password)),
      );
    } catch (error) {
      if (isDuplicateEntry(error)) throw emailTaken();
      throw error;
    }
  }

  async login({ email, password }: LoginDto) {
    const user = await this.users.findByEmail(email);
    const valid = await verifyPassword(
      password,
      user?.passwordHash ?? TIMING_EQUALIZER_HASH,
    );
    if (!user || !valid) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'Unauthorized',
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }
    return this.session(user);
  }

  /** Emails a reset code. Does nothing visible if the email is unknown, so accounts can't be probed. */
  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.users.findByEmail(email);
    if (!user) return;

    // Cooldown: if a code was issued a moment ago, do nothing (the answer looks the
    // same). Without it, someone could spam the owner's inbox, or keep requesting new
    // codes to get fresh guess attempts at the 6 digits.
    const latest = await this.resetTokens.findOne({
      where: { user: { id: user.id } },
      order: { id: 'DESC' },
    });
    if (
      latest &&
      latest.createdAt.getTime() >
        Date.now() - RESET_CODE_COOLDOWN_SECONDS * 1000
    ) {
      return;
    }

    await this.deleteResetTokens(user.id);
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const now = Date.now();
    await this.resetTokens.save(
      this.resetTokens.create({
        user,
        codeHash: this.hashCode(code),
        // Both dates come from this server's clock. If createdAt were left to the
        // database default, a database clock that drifts (e.g. a Docker VM after the
        // computer sleeps) would make the cooldown check above compare two clocks.
        createdAt: new Date(now),
        expiresAt: new Date(now + RESET_CODE_VALID_MINUTES * 60_000),
      }),
    );

    // Not awaited: the response time must not reveal that the account exists.
    this.mail
      .sendPasswordResetCode(user.email, code, RESET_CODE_VALID_MINUTES)
      .catch((error: unknown) =>
        this.logger.error(`Could not send the reset code: ${String(error)}`),
      );
  }

  async resetPassword({ email, code, newPassword }: ResetPasswordDto) {
    const user = await this.users.findByEmail(email);
    const token = user
      ? await this.resetTokens.findOne({
          where: { user: { id: user.id } },
          order: { id: 'DESC' },
        })
      : null;

    if (
      !user ||
      !token ||
      token.expiresAt < new Date() ||
      token.attempts >= RESET_CODE_MAX_ATTEMPTS
    ) {
      throw invalidCode();
    }

    const expected = Buffer.from(token.codeHash);
    const actual = Buffer.from(this.hashCode(code));
    if (
      expected.length !== actual.length ||
      !timingSafeEqual(expected, actual)
    ) {
      await this.resetTokens.increment({ id: token.id }, 'attempts', 1);
      throw invalidCode();
    }

    await this.users.setPassword(user.id, await hashPassword(newPassword));
    await this.deleteResetTokens(user.id);
  }

  private async session(user: User) {
    const token = await this.jwt.signAsync({
      sub: user.id,
      ver: user.tokenVersion,
    });
    return {
      token,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  private hashCode(code: string) {
    return createHmac('sha256', this.config.getOrThrow<string>('JWT_SECRET'))
      .update(code)
      .digest('hex');
  }

  private async deleteResetTokens(userId: number) {
    await this.resetTokens
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .execute();
  }
}
