const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The last `count` calendar days as the admin sees them (oldest first, today last),
 * and the exact moment the first of those days began.
 *
 * Why this exists: timestamps are stored in UTC, but "which day is it?" depends on
 * where the admin is. A rating made at 20:30 in Mexico City (UTC-6) belongs to that
 * day for the admin, even though in UTC it is already the next day.
 *
 * `tzOffset` is the admin's offset from UTC in minutes (UTC-6 is -360).
 * `now` can be passed in to make the function easy to test.
 */
export function lastDays(count: number, tzOffset: number, now = Date.now()) {
  const offsetMs = tzOffset * 60_000;

  // Shifting the clock by the offset makes the UTC fields of this date read like
  // the admin's wall clock (e.g. 20:30 instead of 02:30 of the next day).
  const adminNow = new Date(now + offsetMs);

  // Midnight at the start of the admin's today (kept as a UTC timestamp).
  const todayStart = Date.UTC(
    adminNow.getUTCFullYear(),
    adminNow.getUTCMonth(),
    adminNow.getUTCDate(),
  );

  // Walk back one day at a time to the first day of the range.
  const firstDayStart = todayStart - (count - 1) * DAY_MS;
  const days = Array.from({ length: count }, (_, i) =>
    new Date(firstDayStart + i * DAY_MS).toISOString().slice(0, 10),
  );

  // `firstDayStart` is in "admin wall clock" terms; undo the shift to get the real
  // instant. Ratings made at or after it are inside the range.
  const since = new Date(firstDayStart - offsetMs);

  return { days, since };
}
