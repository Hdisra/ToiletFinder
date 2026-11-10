import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

/** Biggest JSON body accepted. The largest real request is about 1 KB. */
const MAX_BODY_SIZE = '16kb';

/**
 * Everything every request goes through before reaching a controller.
 * Shared by `main.ts` and the tests, so tests check the real setup.
 *
 * Create the app with `{ bodyParser: false }`: the body parser is set up here.
 */
export function configureApp(
  app: NestExpressApplication,
  env: NodeJS.ProcessEnv = process.env,
) {
  app.setGlobalPrefix('api');

  // Security headers (no sniffing of content types, no framing, no referrer leaks...)
  // and it hides the "X-Powered-By: Express" header that tells attackers what we run.
  app.use(helmet());

  // Behind a reverse proxy (nginx, a load balancer...) every request seems to come from
  // the proxy, which breaks the per-IP rate limits. Set TRUST_PROXY_HOPS to the number of
  // proxies in front of the app (usually 1) so the real client IP is used.
  const proxyHops = Number(env.TRUST_PROXY_HOPS);
  if (proxyHops > 0) app.set('trust proxy', proxyHops);

  // Only small JSON bodies. Forms and other formats are not accepted at all.
  app.useBodyParser('json', { limit: MAX_BODY_SIZE });

  // Only the admin web app (a browser) needs CORS; the mobile app doesn't.
  app.enableCors({
    origin:
      env.CORS_ORIGIN?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean) ?? false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // drop fields the DTO doesn't declare...
      forbidNonWhitelisted: true, // ...and refuse the request that sent them
      transform: true,
    }),
  );
}
