import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AdminGuard } from '../auth/admin.guard.js';
import { UserRole } from '../users/user.entity.js';
import { PageQueryDto } from './dto/page-query.dto.js';
import { StatsQueryDto } from './dto/stats-query.dto.js';
import { UpdateBathroomDto } from './dto/update-bathroom.dto.js';
import { UpdateRatingDto } from './dto/update-rating.dto.js';

const contextFor = (user: unknown) =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as ExecutionContext;

describe('AdminGuard', () => {
  const guard = new AdminGuard();

  it('lets admins through', () => {
    expect(guard.canActivate(contextFor({ id: 1, role: UserRole.ADMIN }))).toBe(
      true,
    );
  });

  it('rejects regular users and missing users', () => {
    expect(() =>
      guard.canActivate(contextFor({ id: 2, role: UserRole.USER })),
    ).toThrow(ForbiddenException);
    expect(() => guard.canActivate(contextFor(undefined))).toThrow(
      ForbiddenException,
    );
  });
});

describe('admin DTOs', () => {
  it('validates rating edits', async () => {
    expect(
      await validate(
        plainToInstance(UpdateRatingDto, { score: 7, comment: 'ok' }),
      ),
    ).toHaveLength(0);
    expect(
      await validate(plainToInstance(UpdateRatingDto, { comment: null })),
    ).toHaveLength(0);
    expect(
      await validate(plainToInstance(UpdateRatingDto, { score: 11 })),
    ).not.toHaveLength(0);
    expect(
      await validate(plainToInstance(UpdateRatingDto, { score: 0 })),
    ).not.toHaveLength(0);
  });

  it('applies pagination defaults and limits', async () => {
    const dto = plainToInstance(PageQueryDto, {});
    expect(await validate(dto)).toHaveLength(0);
    expect(dto).toMatchObject({ page: 1, pageSize: 20 });
    expect(
      await validate(plainToInstance(PageQueryDto, { pageSize: '500' })),
    ).not.toHaveLength(0);
    expect(
      await validate(plainToInstance(PageQueryDto, { page: '0' })),
    ).not.toHaveLength(0);
  });
});

describe('bathroom and stats DTOs', () => {
  it('accepts partial bathroom edits and rejects bad values', async () => {
    expect(await validate(plainToInstance(UpdateBathroomDto, {}))).toHaveLength(
      0,
    );
    expect(
      await validate(
        plainToInstance(UpdateBathroomDto, {
          name: 'Nuevo',
          address: null,
          isFree: false,
          price: 8,
        }),
      ),
    ).toHaveLength(0);
    expect(
      await validate(plainToInstance(UpdateBathroomDto, { name: '' })),
    ).not.toHaveLength(0);
    expect(
      await validate(plainToInstance(UpdateBathroomDto, { latitude: 120 })),
    ).not.toHaveLength(0);
    expect(
      await validate(
        plainToInstance(UpdateBathroomDto, { category: 'castle' }),
      ),
    ).not.toHaveLength(0);
    expect(
      await validate(plainToInstance(UpdateBathroomDto, { price: 1.234 })),
    ).not.toHaveLength(0);
  });

  it('parses the timezone offset of the stats query', async () => {
    expect(plainToInstance(StatsQueryDto, {}).tzOffset).toBe(0);
    const dto = plainToInstance(StatsQueryDto, { tzOffset: '-360' });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.tzOffset).toBe(-360);
    expect(
      await validate(plainToInstance(StatsQueryDto, { tzOffset: '9999' })),
    ).not.toHaveLength(0);
  });
});
