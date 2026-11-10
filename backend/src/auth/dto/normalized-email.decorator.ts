import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEmail, MaxLength } from 'class-validator';

/** A valid email, trimmed and lowercased. */
export const NormalizedEmail = () =>
  applyDecorators(
    Transform(({ value }) =>
      typeof value === 'string' ? value.trim().toLowerCase() : value,
    ),
    IsEmail(),
    MaxLength(254),
  );
