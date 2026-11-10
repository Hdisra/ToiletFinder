import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { NormalizedEmail } from './normalized-email.decorator.js';

export class LoginDto {
  @NormalizedEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;
}
