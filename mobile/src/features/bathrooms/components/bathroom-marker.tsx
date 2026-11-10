import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Marker } from "react-native-maps";
import { colors } from "@/theme";
import { formatRating } from "../format";
import type { Bathroom } from "../types";

/** Pin on the map showing the rating; blue if free, orange if paid, bigger when selected. */
export function BathroomMarker({
  bathroom,
  selected,
  onPress,
}: {
  bathroom: Bathroom;
  selected: boolean;
  onPress: () => void;
}) {
  const rating = formatRating(bathroom);
  const color = bathroom.isFree ? colors.brand[500] : colors.paid;

  // The map renders a marker's view to a bitmap. Keep tracking on briefly after a
  // change so it is redrawn, then turn it off (much cheaper, mainly on Android).
  const [tracking, setTracking] = useState(true);
  useEffect(() => {
    setTracking(true);
    const timer = setTimeout(() => setTracking(false), 600);
    return () => clearTimeout(timer);
  }, [rating, selected, bathroom.isFree]);

  return (
    <Marker
      coordinate={{
        latitude: bathroom.latitude,
        longitude: bathroom.longitude,
      }}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={tracking}
      zIndex={selected ? 2 : 1}
      onPress={onPress}
    >
      <View className="items-center p-1">
        <View
          className="min-w-10 items-center rounded-full border-2 border-white px-2.5 py-1"
          style={{
            backgroundColor: color,
            transform: [{ scale: selected ? 1.2 : 1 }],
          }}
        >
          <Text className="text-sm font-bold text-white">{rating ?? "–"}</Text>
        </View>
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 6,
            borderRightWidth: 6,
            borderTopWidth: 8,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: color,
          }}
        />
      </View>
    </Marker>
  );
}
