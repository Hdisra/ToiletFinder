import { api } from "@/api/client";
import type { Bathroom, NearbyBathroom, Rating, SearchArea } from "./types";

/** Bathrooms inside a circle, nearest to its center first. Paid ones only if `includePaid`. */
export const fetchNearbyBathrooms = (area: SearchArea, includePaid: boolean) =>
  api<NearbyBathroom[]>(
    `/bathrooms?lat=${area.lat}&lng=${area.lng}&radius=${area.radius}&includePaid=${includePaid}`,
  );

/** One bathroom with its full data. */
export const fetchBathroom = (id: number) => api<Bathroom>(`/bathrooms/${id}`);

/** The ratings of a bathroom, newest first. */
export const fetchRatings = (id: number) =>
  api<Rating[]>(`/bathrooms/${id}/ratings`);

/** The rating of the logged-in user (404 if none). */
export const fetchMyRating = (id: number) =>
  api<Rating>(`/bathrooms/${id}/ratings/mine`);

/** Creates the rating of the logged-in user, or updates it if there is one. */
export const saveMyRating = (
  id: number,
  rating: { score: number; comment?: string },
) =>
  api<Rating>(`/bathrooms/${id}/ratings/mine`, {
    method: "PUT",
    body: JSON.stringify(rating),
  });
