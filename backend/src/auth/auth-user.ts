import type { Request } from 'express';
import type { UserRole } from '../users/user.entity.js';

/** The logged-in user attached to the request by `AuthGuard`. */
export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}

export type AuthenticatedRequest = Request & { user?: AuthUser };
