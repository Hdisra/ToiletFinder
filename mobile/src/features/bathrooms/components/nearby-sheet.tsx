import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme";
import type { NearbyBathroom } from "../types";
import { BathroomRow } from "./bathroom-row";

/** Heights the list can rest at (collapsed, half, almost full). */
const SNAP_POINTS = ["22%", "50%", "88%"];

/** Always-visible list of the closest bathrooms. Drag it up to see more. */
export function NearbySheet({
  bathrooms,
  loading,
  onSelect,
}: {
  bathrooms: NearbyBathroom[];
  loading: boolean;
  onSelect: (bathroom: NearbyBathroom) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <BottomSheet
      index={0}
      snapPoints={SNAP_POINTS}
      enableDynamicSizing={false}
      backgroundStyle={{ backgroundColor: colors.white }}
      handleIndicatorStyle={{ backgroundColor: colors.brand[200], width: 40 }}
    >
      <View className="px-5 pb-2">
        <View>
          <Text className="text-xl font-bold text-ink">Más cercanos a ti</Text>
          <Text className="text-sm text-muted">
            {loading ? "Buscando…" : `${bathrooms.length} en esta zona`}
          </Text>
        </View>
      </View>

      <BottomSheetFlatList
        data={bathrooms}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <BathroomRow bathroom={item} onPress={() => onSelect(item)} />
        )}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.brand[500]} className="mt-6" />
          ) : (
            <Text className="mt-6 px-8 text-center text-muted">
              Aún no hay baños aquí. ¡Sé el primero en agregar uno!
            </Text>
          )
        }
      />
    </BottomSheet>
  );
}
