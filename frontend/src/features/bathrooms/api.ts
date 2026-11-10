import { api } from '@/api/client'
import type { Page } from '@/api/types'
import type { Bathroom, BathroomInput } from './types'

/** Paging and search options of the admin list. */
export interface ListParams {
  page: number
  pageSize: number
  search: string
}

/** One page of bathrooms (optionally filtered by name) for the admin table. */
export const fetchBathrooms = ({ page, pageSize, search }: ListParams) => {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (search) query.set('search', search)
  return api<Page<Bathroom>>(`/admin/bathrooms?${query}`)
}

/** A single bathroom, used to fill the edit form. */
export const fetchBathroom = (id: number) => api<Bathroom>(`/bathrooms/${id}`)

/** Uses the existing create route; it only accepts admins. */
export const createBathroom = (bathroom: BathroomInput) =>
  api<Bathroom>('/bathrooms', { method: 'POST', body: JSON.stringify(bathroom) })

/** Saves the changes of a bathroom. */
export const updateBathroom = (id: number, bathroom: BathroomInput) =>
  api<Bathroom>(`/admin/bathrooms/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(bathroom),
  })

/** Also deletes the bathroom's ratings. */
export const deleteBathroom = (id: number) =>
  api<void>(`/admin/bathrooms/${id}`, { method: 'DELETE' })
