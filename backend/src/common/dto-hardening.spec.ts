import 'reflect-metadata'; // class-validator/class-transformer decorators need it (Nest loads it in the app)
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PageQueryDto } from '../admin/dto/page-query.dto.js';
import { UpdateBathroomDto } from '../admin/dto/update-bathroom.dto.js';
import { CreateBathroomDto } from '../bathrooms/dto/create-bathroom.dto.js';
import { CreateRatingDto } from '../bathrooms/dto/create-rating.dto.js';

const valid = async (cls: new () => object, data: object) =>
  (await validate(plainToInstance(cls, data))).length === 0;

describe('DTO hardening', () => {
  const bathroom = { name: 'Plaza', latitude: 19.4, longitude: -99.1 };

  it('trims texts, so a name of only spaces is empty and refused', async () => {
    expect(await valid(CreateBathroomDto, { ...bathroom, name: '     ' })).toBe(
      false,
    );
    expect(
      plainToInstance(CreateBathroomDto, { ...bathroom, name: '  Plaza  ' })
        .name,
    ).toBe('Plaza');
    expect(await valid(UpdateBathroomDto, { name: '   ' })).toBe(false);
  });

  it('coordinates must be real numbers, not text that looks like numbers', async () => {
    expect(await valid(CreateBathroomDto, bathroom)).toBe(true);
    expect(
      await valid(CreateBathroomDto, { ...bathroom, latitude: '19.4' }),
    ).toBe(false);
    expect(
      await valid(CreateBathroomDto, {
        ...bathroom,
        longitude: '1; DROP TABLE x',
      }),
    ).toBe(false);
    expect(await valid(UpdateBathroomDto, { latitude: '19.4' })).toBe(false);
    expect(
      await valid(UpdateBathroomDto, { latitude: 19.4, longitude: -99.1 }),
    ).toBe(true);
  });

  it('a comment of only spaces becomes empty (stored as no comment)', async () => {
    const dto = plainToInstance(CreateRatingDto, { score: 5, comment: '    ' });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.comment).toBe('');
  });

  it('limits how far a page number can go', async () => {
    expect(await valid(PageQueryDto, { page: '100000' })).toBe(true);
    expect(await valid(PageQueryDto, { page: '100001' })).toBe(false);
    expect(await valid(PageQueryDto, { page: '99999999999999' })).toBe(false);
  });
});
