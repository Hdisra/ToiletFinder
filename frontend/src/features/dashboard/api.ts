import { api } from '@/api/client'
import type { AdminRating } from '../ratings/types'

/** Numbers shown in the dashboard, as returned by `/admin/stats`. */
export interface Stats {
  /** Counters of the four top cards. `averageScore` is null when there are no ratings. */
  totals: {
    bathrooms: number
    users: number
    ratings: number
    averageScore: number | null
  }
  /** One entry per day, in the admin's timezone; `day` is "YYYY-MM-DD". */
  ratingsPerDay: { day: string; count: number }[]
  /** Bathrooms per category (for the donut chart). */
  bathroomsByCategory: { category: string; count: number }[]
  /** How many ratings each score (1-10) received. */
  scoreDistribution: { score: number; count: number }[]
  /** The latest ratings, newest first. */
  recentRatings: AdminRating[]
}

/** The browser's UTC offset in minutes, so the API groups ratings by the admin's own days. */
const tzOffset = () => -new Date().getTimezoneOffset()

/** Loads the dashboard numbers. */
export const fetchStats = () => api<Stats>(`/admin/stats?tzOffset=${tzOffset()}`)
