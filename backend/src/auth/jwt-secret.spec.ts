import { assertStrongSecret } from './jwt-secret.js';

describe('assertStrongSecret', () => {
  it('accepts a long random secret', () => {
    const secret = 'k3Jx9Qm2Zp7Wd4Rt8Vb1Nc6Hy5Gf0Ls3Ua9Ei2Ox7Tq4Mw==';
    expect(assertStrongSecret(secret)).toBe(secret);
  });

  it('refuses the placeholder and short secrets', () => {
    expect(() => assertStrongSecret('change-me')).toThrow(/JWT_SECRET/);
    expect(() => assertStrongSecret('short')).toThrow(/at least 32/);
    expect(() => assertStrongSecret('')).toThrow();
  });
});
