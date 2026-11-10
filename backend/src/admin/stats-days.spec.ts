import { lastDays } from './stats-days.js';

const utc = (iso: string) => Date.parse(iso);

describe('lastDays', () => {
  it('lists the days ending today, oldest first', () => {
    const { days, since } = lastDays(3, -360, utc('2026-11-07T19:00:00Z'));
    expect(days).toEqual(['2026-11-05', '2026-11-06', '2026-11-07']);
    // 00:00 on Nov 5 in UTC-6 is 06:00 UTC.
    expect(since.toISOString()).toBe('2026-11-05T06:00:00.000Z');
  });

  it("uses the admin's day when UTC is already tomorrow", () => {
    // 02:30 UTC on Nov 7 is still the evening of Nov 6 in UTC-6.
    const { days } = lastDays(2, -360, utc('2026-11-07T02:30:00Z'));
    expect(days).toEqual(['2026-11-05', '2026-11-06']);
  });

  it('works with offsets ahead of UTC, including half hours', () => {
    // 20:00 UTC on Nov 7 is 01:30 on Nov 8 in UTC+5:30.
    const { days, since } = lastDays(1, 330, utc('2026-11-07T20:00:00Z'));
    expect(days).toEqual(['2026-11-08']);
    expect(since.toISOString()).toBe('2026-11-07T18:30:00.000Z');
  });

  it('crosses month boundaries', () => {
    const { days } = lastDays(3, 0, utc('2026-11-01T12:00:00Z'));
    expect(days).toEqual(['2026-10-30', '2026-10-31', '2026-11-01']);
  });

  it('returns exactly `count` days', () => {
    expect(lastDays(30, 0).days).toHaveLength(30);
  });
});
