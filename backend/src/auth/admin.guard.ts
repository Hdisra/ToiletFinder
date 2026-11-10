import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '../users/user.entity.js';
import type { AuthenticatedRequest } from './auth-user.js';

/** Only admins. Use after `AuthGuard`: `@UseGuards(AuthGuard, AdminGuard)`. */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (user?.role !== UserRole.ADMIN) throw new ForbiddenException();
    return true;
  }
}
