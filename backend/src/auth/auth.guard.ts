import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import type { AuthenticatedRequest } from './auth-user.js';

interface TokenPayload {
  sub: number;
  ver: number;
}

/** Requires `Authorization: Bearer <token>` from a valid, not revoked token. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    // The header must be exactly "Bearer <token>": two parts, nothing extra.
    const parts = (request.header('authorization') ?? '').split(' ');
    const [scheme, token] = parts;
    if (parts.length !== 2 || scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException();
    }

    let payload: TokenPayload;
    try {
      payload = await this.jwt.verifyAsync<TokenPayload>(token);
    } catch {
      throw new UnauthorizedException();
    }

    // The signature is valid, but still check the claims have the expected types.
    if (
      !Number.isSafeInteger(payload.sub) ||
      !Number.isSafeInteger(payload.ver)
    ) {
      throw new UnauthorizedException();
    }

    const user = await this.users.findById(payload.sub);
    if (!user || user.tokenVersion !== payload.ver) {
      throw new UnauthorizedException();
    }
    request.user = { id: user.id, email: user.email, role: user.role };
    return true;
  }
}
