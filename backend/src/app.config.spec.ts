import { Body, Controller, Get, Post } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { IsString } from 'class-validator';
import request from 'supertest';
import { configureApp } from './app.config.js';

class PingDto {
  @IsString()
  name: string;
}

@Controller('ping')
class PingController {
  @Get()
  get() {
    return { ok: true };
  }

  @Post()
  post(@Body() dto: PingDto) {
    return { name: dto.name };
  }
}

describe('app setup (configureApp)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [PingController],
    }).compile();
    app = module.createNestApplication<NestExpressApplication>({
      bodyParser: false,
    });
    configureApp(app, { CORS_ORIGIN: 'http://localhost:5173' });
    await app.init();
  });

  afterAll(() => app.close());

  it('sends security headers and hides the framework', async () => {
    const res = await request(app.getHttpServer()).get('/api/ping').expect(200);
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
    expect(res.headers['referrer-policy']).toBeDefined();
  });

  it('rejects fields that the DTO does not declare', async () => {
    await request(app.getHttpServer())
      .post('/api/ping')
      .send({ name: 'ok', role: 'admin' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/ping')
      .send({ name: 'ok' })
      .expect(201);
  });

  it('rejects wrong types', async () => {
    await request(app.getHttpServer())
      .post('/api/ping')
      .send({ name: { $ne: '' } })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/ping')
      .send({ name: 123 })
      .expect(400);
  });

  it('refuses a JSON body over 16 KB', async () => {
    await request(app.getHttpServer())
      .post('/api/ping')
      .send({ name: 'x'.repeat(20_000) })
      .expect(413);
  });

  it('only accepts JSON (forms are not parsed)', async () => {
    await request(app.getHttpServer())
      .post('/api/ping')
      .type('form')
      .send('name=ok')
      .expect(400);
  });

  it('allows CORS only for the configured origin', async () => {
    const allowed = await request(app.getHttpServer())
      .get('/api/ping')
      .set('Origin', 'http://localhost:5173');
    expect(allowed.headers['access-control-allow-origin']).toBe(
      'http://localhost:5173',
    );

    const evil = await request(app.getHttpServer())
      .get('/api/ping')
      .set('Origin', 'http://evil.example');
    expect(evil.headers['access-control-allow-origin']).toBeUndefined();
  });
});
