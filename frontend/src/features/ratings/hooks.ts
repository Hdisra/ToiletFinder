import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { deleteRating, fetchRatings, updateRating, type ListParams } from './api'

/** Query: a page of ratings. Keeps the previous page on screen while the next loads. */
export const useRatings = (params: ListParams) =>
  useQuery({
    queryKey: ['admin', 'ratings', params],
    queryFn: () => fetchRatings(params),
    placeholderData: keepPreviousData,
  })

/** Mutation: edits the score and/or comment of a rating and refreshes the admin data. */
export function useUpdateRating() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number
      score?: number
      comment?: string | null
    }) => updateRating(id, data),
    // Averages in the bathroom list and the dashboard changed too.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  })
}

/** Mutation: deletes a rating and refreshes the admin data. */
export function useDeleteRating() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRating,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  })
}
