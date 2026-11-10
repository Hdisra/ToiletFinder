import {
  randomBytes,
  scrypt,
  timingSafeEqual,
  type ScryptOptions,
} from 'node:crypto';

// scrypt parameters recommended by OWASP (N=2^15, r=8, p=3).
const N = 2 ** 15;
const R = 8;
const P = 3;
const KEY_LENGTH = 64;
const MAX_MEMORY = 128 * N * R * 2;

const derive = (
  password: string,
  salt: Buffer,
  n: number,
  r: number,
  p: number,
) =>
  new Promise<Buffer>((resolve, reject) => {
    const options: ScryptOptions = { N: n, r, p, maxmem: MAX_MEMORY };
    scrypt(password, salt, KEY_LENGTH, options, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });

/** Returns `scrypt$N$r$p$salt$hash` (the parameters are stored so they can change later). */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, R, P);
  return [
    'scrypt',
    N,
    R,
    P,
    salt.toString('base64'),
    key.toString('base64'),
  ].join('$');
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, n, r, p, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = await derive(
    password,
    Buffer.from(salt, 'base64'),
    Number(n),
    Number(r),
    Number(p),
  );
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
