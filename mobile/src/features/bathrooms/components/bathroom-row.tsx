import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Pressable, Text, View } from "react-native";
import { colors } from "@/theme";
import { formatDistance } from "@/utils/geo";
import { categoryOf } from "../categories";
import { formatPrice, formatRating } from "../format";
import type { NearbyBathroom } from "../types";

/** One line of the nearby list: icon, name, distance, rating and price. */
export function BathroomRow({
  bathroom,
  onPress,
}: {
  bathroom: NearbyBathroom;
  onPress: () => void;
}) {
  const category = categoryOf(bathroom.category);
  const rating = formatRating(bathroom);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl px-5 py-3 active:bg-brand-50"
    >
      <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-100">
        <Ionicons name={category.icon} size={20} color={colors.brand[600]} />
      </View>
      <View className="flex-1">
        <Text numberOfLines={1} className="text-base font-semibold text-ink">
          {bathroom.name}
        </Text>
        <Text className="text-sm text-muted">
          {formatDistance(bathroom.distance)} · {category.label}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-sm font-semibold text-ink">
          {rating ? `★ ${rating}` : "Nuevo"}
        </Text>
        <Text
          className={`text-xs font-medium ${bathroom.isFree ? "text-free" : "text-paid"}`}
        >
          {formatPrice(bathroom)}
        </Text>
      </View>
    </Pressable>
  );
}
