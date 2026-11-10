/** A rating as shown to the admin (with its bathroom and author). */
export interface AdminRating {
  id: number
  score: number
  comment: string | null
  /** ISO date, in UTC. */
  createdAt: string
  bathroom: { id: number; name: string }
  /** null for ratings made before accounts existed. */
  userEmail: string | null
}
