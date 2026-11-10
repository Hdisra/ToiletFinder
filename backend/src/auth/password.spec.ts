import { hashPassword, verifyPassword } from './password.js';

describe('password hashing', () => {
  it('verifies the right password and rejects a wrong one', async () => {
    const stored = await hashPassword('correct horse battery');
    expect(stored.startsWith('scrypt$')).toBe(true);
    expect(await verifyPassword('correct horse battery', stored)).toBe(true);
    expect(await verifyPassword('wrong password', stored)).toBe(false);
  });

  it('uses a different salt each time', async () => {
    expect(await hashPassword('same')).not.toBe(await hashPassword('same'));
  });

  it('rejects malformed stored values', async () => {
    expect(await verifyPassword('x', 'not-a-hash')).toBe(false);
  });
});
