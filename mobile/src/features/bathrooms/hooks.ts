import { ApiError } from "@/api/client";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchBathroom,
  fetchMyRating,
  fetchNearbyBathrooms,
  fetchRatings,
  saveMyRating,
} from "./api";
import type { Bathroom, SearchArea } from "./types";

/** Cache keys of the bathroom queries. Invalidating `all` refreshes every one of them. */
export const bathroomKeys = {
  all: ["bathrooms"] as const,
  nearby: (area: SearchArea | undefined, includePaid: boolean) =>
    [...bathroomKeys.all, "nearby", area, includePaid] as const,
  detail: (id: number) => [...bathroomKeys.all, "detail", id] as const,
  ratings: (id: number) => [...bathroomKeys.all, "ratings", id] as const,
  myRating: (id: number) => [...bathroomKeys.all, "my-rating", id] as const,
};

/** Query: bathrooms around `area` (waits until there is one). */
export function useNearbyBathrooms(
  area: SearchArea | undefined,
  includePaid: boolean,
) {
  return useQuery({
    queryKey: bathroomKeys.nearby(area, includePaid),
    queryFn: () => fetchNearbyBathrooms(area!, includePaid),
    enabled: !!area,
    // Keep showing the previous results while the map moves to a new area.
    placeholderData: keepPreviousData,
  });
}

/** `preview` is shown instantly while the full record loads. */
export function useBathroom(id: number | undefined, preview?: Bathroom) {
  return useQuery({
    queryKey: bathroomKeys.detail(id ?? 0),
    queryFn: () => fetchBathroom(id!),
    enabled: id !== undefined,
    placeholderData: preview,
  });
}

/** Query: the ratings of a bathroom. */
export function useRatings(id: number | undefined) {
  return useQuery({
    queryKey: bathroomKeys.ratings(id ?? 0),
    queryFn: () => fetchRatings(id!),
    enabled: id !== undefined,
  });
}

/** The rating the logged-in user already gave to the bathroom, or null. */
export function useMyRating(id: number) {
  return useQuery({
    queryKey: bathroomKeys.myRating(id),
    queryFn: async () => {
      try {
        return await fetchMyRating(id);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
  });
}

/** Creates or updates the logged-in user's rating. */
export function useSaveRating(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rating: { score: number; comment?: string }) =>
      saveMyRating(id, rating),
    onSuccess: (rating) => {
      queryClient.setQueryData(bathroomKeys.myRating(id), rating);
      return queryClient.invalidateQueries({ queryKey: bathroomKeys.all });
    },
  });
}
