import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  createBathroom,
  deleteBathroom,
  fetchBathroom,
  fetchBathrooms,
  updateBathroom,
  type ListParams,
} from './api'
import type { BathroomInput } from './types'

/** Query: a page of bathrooms. Keeps the previous page on screen while the next loads. */
export const useBathrooms = (params: ListParams) =>
  useQuery({
    queryKey: ['admin', 'bathrooms', params],
    queryFn: () => fetchBathrooms(params),
    placeholderData: keepPreviousData,
  })

/** Query: one bathroom by id. */
export const useBathroom = (id: number) =>
  useQuery({
    queryKey: ['admin', 'bathroom', id],
    queryFn: () => fetchBathroom(id),
  })

/** Mutation: creates a bathroom and refreshes the admin data. */
export function useCreateBathroom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBathroom,
    // The list and the dashboard numbers changed.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  })
}

/** Mutation: edits bathroom `id` and refreshes the admin data. */
export function useUpdateBathroom(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bathroom: BathroomInput) => updateBathroom(id, bathroom),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  })
}

/** Mutation: deletes a bathroom and refreshes the admin data. */
export function useDeleteBathroom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBathroom,
    // Ratings went away with it, so lists and the dashboard changed.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  })
}
