import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import type { UsersService } from '../users/users.service.js';
import { UserRole } from '../users/user.entity.js';
import { AuthGuard } from './auth.guard.js';

const user = {
  id: 7,
  email: 'ana@example.com',
  role: UserRole.USER,
  tokenVersion: 2,
};

function setup(payload: unknown, found: unknown = user) {
  const verifyAsync = vi.fn().mockResolvedValue(payload);
  const findById = vi.fn().mockResolvedValue(found);
  const guard = new AuthGuard(
    { verifyAsync } as unknown as JwtService,
    { findById } as unknown as UsersService,
  );
  const call = (authorization?: string) => {
    const request: Record<string, unknown> = {
      header: (name: string) =>
        name === 'authorization' ? authorization : undefined,
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;
    return { request, result: guard.canActivate(context) };
  };
  return { call, verifyAsync, findById };
}

describe('AuthGuard', () => {
  it('lets a valid token through and sets the user', async () => {
    const { call } = setup({ sub: 7, ver: 2 });
    const { request, result } = call('Bearer abc.def.ghi');
    await expect(result).resolves.toBe(true);
    expect(request.user).toEqual({
      id: 7,
      email: 'ana@example.com',
      role: 'user',
    });
  });

  it('requires exactly "Bearer <token>"', async () => {
    const { call, verifyAsync } = setup({ sub: 7, ver: 2 });
    for (const header of [
      undefined,
      '',
      'Bearer',
      'Bearer ',
      'Basic abc',
      'bearer abc',
      'Bearer a b',
      'Bearer  a',
    ]) {
      await expect(call(header).result).rejects.toThrow(UnauthorizedException);
    }
    expect(verifyAsync).not.toHaveBeenCalled(); // never even looked at those tokens
  });

  it('rejects a token that fails verification (forged, expired, wrong algorithm)', async () => {
    const { call, verifyAsync } = setup(null);
    verifyAsync.mockRejectedValue(new Error('invalid signature'));
    await expect(call('Bearer abc').result).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects claims with the wrong type, even if the signature is valid', async () => {
    for (const payload of [
      { sub: '1 OR 1=1', ver: 2 },
      { sub: 7, ver: '2' },
      { sub: 1.5, ver: 2 },
      { sub: null, ver: 2 },
      {},
    ]) {
      const { call, findById } = setup(payload);
      await expect(call('Bearer abc').result).rejects.toThrow(
        UnauthorizedException,
      );
      expect(findById).not.toHaveBeenCalled();
    }
  });

  it('rejects a deleted user and a revoked token version', async () => {
    await expect(
      setup({ sub: 7, ver: 2 }, null).call('Bearer abc').result,
    ).rejects.toThrow(UnauthorizedException);
    await expect(
      setup({ sub: 7, ver: 1 }).call('Bearer abc').result,
    ).rejects.toThrow(UnauthorizedException);
  });
});
