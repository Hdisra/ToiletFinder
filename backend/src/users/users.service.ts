import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  findById(id: number) {
    return this.users.findOneBy({ id });
  }

  findByEmail(email: string) {
    return this.users.findOneBy({ email });
  }

  create(email: string, passwordHash: string) {
    return this.users.save(this.users.create({ email, passwordHash }));
  }

  /** Sets a new password and invalidates every token issued before. */
  async setPassword(id: number, passwordHash: string) {
    await this.users.update(id, {
      passwordHash,
      tokenVersion: () => 'tokenVersion + 1',
    });
  }

  /** Makes `email` an admin: creates the account, or promotes it if it already exists. */
  async ensureAdmin(email: string, passwordHash: string) {
    const existing = await this.findByEmail(email);
    if (!existing) {
      await this.users.save(
        this.users.create({ email, passwordHash, role: UserRole.ADMIN }),
      );
      return 'created' as const;
    }
    if (existing.role === UserRole.ADMIN) return 'already' as const;
    await this.users.update(existing.id, { role: UserRole.ADMIN });
    return 'promoted' as const;
  }
}
