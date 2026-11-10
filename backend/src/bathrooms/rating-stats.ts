import type { EntityManager } from 'typeorm';
import { Bathroom } from './bathroom.entity.js';
import { Rating } from './rating.entity.js';

/**
 * Keeps a bathroom's rating summary up to date.
 *
 * The `bathroom` table stores two ready-made numbers: `averageRating` and `ratingCount`.
 * They could be worked out from the `rating` table whenever needed, but keeping them
 * stored means the map and the lists can show the stars without calculating an average
 * for every bathroom on every request.
 *
 * The price of that shortcut: whenever a rating is created, edited or deleted, the two
 * numbers become outdated, so they have to be recalculated. That is what this does:
 *
 *   1. Count the bathroom's ratings.
 *   2. Average their scores (no ratings, no average: it becomes null).
 *   3. Save both numbers on the bathroom.
 *
 * Pass the `manager` of the transaction that changes the rating, so the rating and its
 * new summary are saved together (or neither is).
 */
export async function recalculateRatingStats(
  manager: EntityManager,
  bathroomId: number,
) {
  // "Only the ratings of this bathroom."
  const ofThisBathroom = { bathroom: { id: bathroomId } };

  const ratingCount = await manager.count(Rating, { where: ofThisBathroom });
  const average = await manager.average(Rating, 'score', ofThisBathroom);

  await manager.update(Bathroom, bathroomId, {
    // Stored as text with 2 decimals, e.g. "8.50"; null when there are no ratings.
    averageRating: average === null ? null : average.toFixed(2),
    ratingCount,
  });
}
