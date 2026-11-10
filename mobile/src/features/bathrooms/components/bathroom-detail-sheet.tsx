import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageDialog } from "@/components/message-dialog";
import { Badge } from "@/components/ui";
import { colors } from "@/theme";
import { categoryOf } from "../categories";
import { formatPrice, formatRating } from "../format";
import { useBathroom, useRatings } from "../hooks";
import type { Bathroom } from "../types";
import { RateBathroom } from "./rate-bathroom";

/** Heights the sheet can rest at. */
const SNAP_POINTS = ["60%", "92%"];
/** How long the thank-you dialog stays before the sheet closes. */
const THANKS_DURATION_MS = 2000;

/** Bottom modal with everything about one bathroom. Opens when `bathroom` is set. */
export function BathroomDetailSheet({
  bathroom,
  onClose,
}: {
  bathroom: Bathroom | null;
  onClose: () => void;
}) {
  // `ref` controls the sheet; `id` is the open bathroom (undefined = closed).
  const ref = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const id = bathroom?.id;

  // `detail` = full record (the list data is shown meanwhile), `ratings` = the opinions list.
  const detail = useBathroom(id, bathroom ?? undefined);
  const ratings = useRatings(id);
  const [thanks, setThanks] = useState(false);

  // Open the sheet whenever a bathroom is selected.
  useEffect(() => {
    if (id !== undefined) ref.current?.present();
  }, [id]);

  // After a rating, show the thank-you dialog, then close it and this sheet.
  useEffect(() => {
    if (!thanks) return;
    const timer = setTimeout(() => {
      setThanks(false);
      ref.current?.dismiss();
    }, THANKS_DURATION_MS);
    return () => clearTimeout(timer);
  }, [thanks]);

  /** Dimmed layer behind the sheet. */
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.25}
      />
    ),
    [],
  );

  // Prefer the full record; fall back to the one received from the list.
  const b = detail.data ?? bathroom;
  const category = b ? categoryOf(b.category) : null;
  const rating = b ? formatRating(b) : null;

  /** Opens walking directions to the bathroom in the maps app. */
  const openDirections = () => {
    if (!b) return;
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${b.latitude},${b.longitude}&travelmode=walking`,
    ).catch(() => Alert.alert("No se pudo abrir el mapa"));
  };

  return (
    <>
      <BottomSheetModal
        ref={ref}
        snapPoints={SNAP_POINTS}
        enableDynamicSizing={false}
        onDismiss={onClose}
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={{ backgroundColor: colors.white }}
        handleIndicatorStyle={{ backgroundColor: colors.brand[200], width: 40 }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 24,
            gap: 20,
          }}
        >
          {b && category ? (
            <>
              <View className="gap-3">
                <Text className="text-2xl font-bold text-ink">{b.name}</Text>
                {b.address ? (
                  <Text className="text-muted">{b.address}</Text>
                ) : null}
                <View className="flex-row flex-wrap gap-2">
                  <Badge label={category.label} icon={category.icon} />
                  <Badge
                    label={formatPrice(b)}
                    icon={b.isFree ? "checkmark-circle" : "pricetag"}
                    tone={b.isFree ? "free" : "paid"}
                  />
                </View>
              </View>

              <View className="flex-row items-center justify-between rounded-3xl bg-brand-50 p-4">
                <View>
                  <View className="flex-row items-end">
                    <Text className="text-4xl font-bold text-ink">
                      {rating ?? "–"}
                    </Text>
                    {rating ? (
                      <Text className="mb-1 text-base text-muted"> /10</Text>
                    ) : null}
                  </View>
                  <Text className="text-sm text-muted">
                    {b.ratingCount > 0
                      ? `${b.ratingCount} ${b.ratingCount === 1 ? "calificación" : "calificaciones"}`
                      : "Sin calificaciones aún"}
                  </Text>
                </View>
                <Pressable
                  onPress={openDirections}
                  className="flex-row items-center gap-2 rounded-full bg-brand-500 px-5 py-3 active:bg-brand-600"
                >
                  <Ionicons name="navigate" size={18} color={colors.white} />
                  <Text className="font-semibold text-white">Cómo llegar</Text>
                </Pressable>
              </View>

              <RateBathroom
                key={b.id}
                bathroomId={b.id}
                onRated={() => setThanks(true)}
              />

              <View className="gap-3">
                <Text className="text-base font-bold text-ink">Opiniones</Text>
                {ratings.isPending ? (
                  <ActivityIndicator color={colors.brand[500]} />
                ) : ratings.data?.length ? (
                  ratings.data.map((r) => (
                    <View key={r.id} className="flex-row gap-3">
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-100">
                        <Text className="font-bold text-brand-700">
                          {r.score}
                        </Text>
                      </View>
                      <View className="flex-1">
                        {r.comment ? (
                          <Text className="text-ink">{r.comment}</Text>
                        ) : null}
                        <Text className="text-xs text-muted">
                          {new Date(r.createdAt).toLocaleDateString("es")}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text className="text-muted">Aún no hay opiniones.</Text>
                )}
              </View>
            </>
          ) : null}
        </BottomSheetScrollView>
      </BottomSheetModal>
      <MessageDialog visible={thanks} title="¡Gracias por tu opinión!" />
    </>
  );
}
