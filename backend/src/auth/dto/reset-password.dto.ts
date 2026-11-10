import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { NormalizedEmail } from './normalized-email.decorator.js';

export class ResetPasswordDto {
  @NormalizedEmail()
  email: string;

  @Matches(/^\d{6}$/)
  code: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}
