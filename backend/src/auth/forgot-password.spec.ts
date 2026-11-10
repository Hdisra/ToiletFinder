import { AuthService } from './auth.service.js';

const user = { id: 3, email: 'ana@example.com' };

function setup(found: unknown, latestToken: unknown) {
  const send = vi.fn().mockResolvedValue(undefined);
  const save = vi.fn().mockResolvedValue({});
  const execute = vi.fn().mockResolvedValue({});
  const resetTokens = {
    findOne: vi.fn().mockResolvedValue(latestToken),
    create: vi.fn((data: object) => data),
    save,
    createQueryBuilder: () => ({
      delete: () => ({ where: () => ({ execute }) }),
    }),
  };
  const service = new AuthService(
    { findByEmail: vi.fn().mockResolvedValue(found) } as never,
    {} as never,
    { sendPasswordResetCode: send } as never,
    { getOrThrow: () => 'a-test-secret-with-more-than-32-characters' } as never,
    resetTokens as never,
  );
  return { service, send, save, execute };
}

describe('AuthService.forgotPassword', () => {
  it('sends a code to an existing account', async () => {
    const { service, send, save } = setup(user, null);
    await service.forgotPassword({ email: user.email });
    expect(save).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][1]).toMatch(/^\d{6}$/); // a 6-digit code
    // createdAt is set by the server (not the database) so the cooldown uses one clock
    const saved = save.mock.calls[0][0] as { createdAt: Date; expiresAt: Date };
    expect(Math.abs(saved.createdAt.getTime() - Date.now())).toBeLessThan(5000);
    expect(saved.expiresAt.getTime() - saved.createdAt.getTime()).toBe(
      15 * 60_000,
    );
  });

  it('does nothing visible for an unknown email', async () => {
    const { service, send, save } = setup(null, null);
    await expect(
      service.forgotPassword({ email: 'ghost@example.com' }),
    ).resolves.toBeUndefined();
    expect(save).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it('ignores a second request made within the cooldown', async () => {
    const { service, send, save, execute } = setup(user, {
      createdAt: new Date(),
    });
    await service.forgotPassword({ email: user.email });
    expect(send).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled(); // the existing code is left untouched
  });

  it('sends a new code once the cooldown has passed', async () => {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const { service, send } = setup(user, { createdAt: twoMinutesAgo });
    await service.forgotPassword({ email: user.email });
    expect(send).toHaveBeenCalledTimes(1);
  });
});
