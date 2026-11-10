import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transport: Transporter;
  private readonly from: string;

  constructor(config: ConfigService) {
    const port = Number(config.getOrThrow<string>('SMTP_PORT'));
    const user = config.get<string>('SMTP_USER');
    this.from = config.getOrThrow<string>('MAIL_FROM');
    this.transport = nodemailer.createTransport({
      host: config.getOrThrow<string>('SMTP_HOST'),
      port,
      secure: port === 465,
      auth: user
        ? { user, pass: config.getOrThrow<string>('SMTP_PASSWORD') }
        : undefined,
    });
  }

  async sendPasswordResetCode(to: string, code: string, validMinutes: number) {
    await this.transport.sendMail({
      from: this.from,
      to,
      subject: 'Tu código para restablecer la contraseña',
      text: [
        'Hola,',
        '',
        'Tu código para restablecer la contraseña de Toilet Finder es:',
        '',
        `    ${code}`,
        '',
        `Vence en ${validMinutes} minutos. Si no lo solicitaste, ignora este mensaje.`,
      ].join('\n'),
    });
  }
}
