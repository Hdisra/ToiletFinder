import type { BathroomCategory } from './categories'

/** A bathroom as returned by the API. */
export interface Bathroom {
  id: number
  name: string
  address: string | null
  category: BathroomCategory
  latitude: number
  longitude: number
  isFree: boolean
  /** Decimal sent as text, e.g. "10.50". Null when free. */
  price: string | null
  /** Decimal sent as text, e.g. "8.50". Null when there are no ratings. */
  averageRating: string | null
  ratingCount: number
  /** ISO date, in UTC. */
  createdAt: string
}

/** What the bathroom form produces; used to create and to edit. */
export interface BathroomInput {
  name: string
  category: BathroomCategory
  /** null removes the address. */
  address: string | null
  latitude: number
  longitude: number
  isFree: boolean
  price?: number
}
