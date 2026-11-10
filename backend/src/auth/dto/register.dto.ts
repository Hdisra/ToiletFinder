import { IsString, MaxLength, MinLength } from 'class-validator';
import { NormalizedEmail } from './normalized-email.decorator.js';

export class RegisterDto {
  @NormalizedEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
