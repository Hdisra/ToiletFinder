import { NormalizedEmail } from './normalized-email.decorator.js';

export class ForgotPasswordDto {
  @NormalizedEmail()
  email: string;
}
