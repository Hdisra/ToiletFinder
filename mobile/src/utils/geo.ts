import type { Coordinates } from "@/features/bathrooms/types";

/** Mean radius of the Earth, in meters. */
const EARTH_RADIUS_M = 6371000;
/** Length of one degree of latitude, in meters. */
const METERS_PER_DEGREE = 111320;

/** Degrees to radians. */
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Haversine distance in meters. */
export function distanceMeters(a: Coordinates, b: Coordinates) {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Radius in meters that covers a map region (half of its larger side). */
export function regionRadiusMeters(region: {
  latitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}) {
  const height = region.latitudeDelta * METERS_PER_DEGREE;
  const width =
    region.longitudeDelta * METERS_PER_DEGREE * Math.cos(rad(region.latitude));
  return Math.max(height, width) / 2;
}

/** "250 m" below one kilometer, otherwise "1.3 km". */
export function formatDistance(meters: number) {
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(1)} km`;
}
