import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import type { Coordinates } from "@/features/bathrooms/types";

/** Query: asks for the location permission and returns the phone's position (no retries if denied). */
export function useCurrentLocation() {
  return useQuery({
    queryKey: ["current-location"],
    queryFn: async (): Promise<Coordinates> => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") throw new Error("Location permission denied");
      const { coords } = await Location.getCurrentPositionAsync({});
      return { lat: coords.latitude, lng: coords.longitude };
    },
    retry: false,
    staleTime: 60_000,
  });
}
