/** Values the API accepts for the type of place. */
export type BathroomCategory =
  | "mall"
  | "supermarket"
  | "park"
  | "restaurant"
  | "gas_station"
  | "public"
  | "other";

/** A bathroom as returned by the API. */
export interface Bathroom {
  id: number;
  name: string;
  address: string | null;
  category: BathroomCategory;
  latitude: number;
  longitude: number;
  isFree: boolean;
  /** Decimal sent as text, e.g. "10.50". Null when free. */
  price: string | null;
  /** Decimal sent as text, e.g. "8.50". Null when there are no ratings. */
  averageRating: string | null;
  ratingCount: number;
}

export interface NearbyBathroom extends Bathroom {
  /** Meters from the search center. */
  distance: number;
}

/** A rating of a bathroom. */
export interface Rating {
  id: number;
  score: number;
  comment: string | null;
  createdAt: string;
}

/** A point on the map. */
export interface Coordinates {
  lat: number;
  lng: number;
}

/** Circle to search in: center plus radius in meters. */
export interface SearchArea extends Coordinates {
  radius: number;
}
