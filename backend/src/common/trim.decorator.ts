import { Transform } from 'class-transformer';

/** Removes spaces at the start and end of a text, so "   " counts as empty. */
export const Trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
