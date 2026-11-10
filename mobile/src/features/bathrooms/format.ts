import type { Bathroom } from "./types";

/** Average score with one decimal ("8.5"), or null when there are no ratings. */
export const formatRating = (b: Pick<Bathroom, "averageRating">) =>
  b.averageRating ? Number(b.averageRating).toFixed(1) : null;

/** "Gratis" for free bathrooms, otherwise the price with two decimals ("$10.50"). */
export const formatPrice = (b: Pick<Bathroom, "isFree" | "price">) =>
  b.isFree ? "Gratis" : `$${Number(b.price).toFixed(2)}`;
