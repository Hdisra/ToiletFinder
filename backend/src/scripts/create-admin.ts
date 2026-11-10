import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { hashPassword } from '../auth/password.js';
import { UsersService } from '../users/users.service.js';

// Usage: set ADMIN_EMAIL and ADMIN_PASSWORD (in .env or the shell), then `pnpm admin:create`.
const app = await NestFactory.createApplicationContext(AppModule, {
  logger: ['error', 'warn'],
});

try {
  const config = app.get(ConfigService);
  const email = config.get<string>('ADMIN_EMAIL')?.trim().toLowerCase();
  const password = config.get<string>('ADMIN_PASSWORD');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Set ADMIN_EMAIL to a valid email.');
  }
  if (!password || password.length < 8) {
    throw new Error('Set ADMIN_PASSWORD (at least 8 characters).');
  }

  const result = await app
    .get(UsersService)
    .ensureAdmin(email, await hashPassword(password));
  const messages = {
    created: `Admin account created for ${email}.`,
    promoted: `${email} already existed: it is now an admin (its password was not changed).`,
    already: `${email} is already an admin (nothing changed).`,
  };
  console.log(messages[result]);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await app.close();
}
