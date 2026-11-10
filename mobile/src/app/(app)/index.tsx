import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, type Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/ui";
import { BathroomDetailSheet } from "@/features/bathrooms/components/bathroom-detail-sheet";
import { BathroomMarker } from "@/features/bathrooms/components/bathroom-marker";
import { NearbySheet } from "@/features/bathrooms/components/nearby-sheet";
import { useNearbyBathrooms } from "@/features/bathrooms/hooks";
import type { Bathroom, SearchArea } from "@/features/bathrooms/types";
import { useAuth } from "@/features/auth/auth-context";
import { mapStyle } from "@/features/map/map-style";
import { useCurrentLocation } from "@/hooks/use-current-location";
import { colors } from "@/theme";
import { errorMessage } from "@/utils/errors";
import { distanceMeters, regionRadiusMeters } from "@/utils/geo";

// Android always uses Google Maps. iOS uses Apple Maps unless this is an iOS
// development build configured with a Google Maps key (see README).
const googleMapsEnabled =
  Platform.OS === "android" ||
  process.env.EXPO_PUBLIC_IOS_GOOGLE_MAPS === "true";

/** Search radius around the user before the map is moved. */
const INITIAL_RADIUS_M = 1500;
/** Smallest and largest search radius. */
const MIN_RADIUS_M = 200;
const MAX_RADIUS_M = 50_000; // the API accepts up to 50 km

/** Rounds to a number of decimals (coordinates are rounded before being sent). */
const round = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/** Keeps a latitude in -90..90 and wraps a longitude into -180..180: the ranges the API accepts. */
const toValidLat = (lat: number) => Math.max(-90, Math.min(90, lat));
const toValidLng = (lng: number) => ((((lng + 180) % 360) + 360) % 360) - 180;

/** Main screen: map with the nearby bathrooms, the list sheet and the detail sheet. */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  // Refs to the map (to move it) and to the last region it reported.
  const mapRef = useRef<MapView>(null);
  const regionRef = useRef<Region | null>(null);

  // Phone position (asks for permission the first time) and login state.
  const location = useCurrentLocation();
  const { state: auth, signOut } = useAuth();
  // includePaid = switch state, area = visible map area, selected = bathroom open in the detail sheet.
  const [includePaid, setIncludePaid] = useState(false);
  const [area, setArea] = useState<SearchArea>();
  const [selected, setSelected] = useState<Bathroom | null>(null);

  // Search around the user until the map is moved; after that, around the visible area.
  const user = location.data;
  const searchArea =
    area ??
    (user
      ? // Rounded (about 10 m) before it leaves the phone.
        {
          lat: round(user.lat, 4),
          lng: round(user.lng, 4),
          radius: INITIAL_RADIUS_M,
        }
      : undefined);
  const nearby = useNearbyBathrooms(searchArea, includePaid);

  // The API sorts by distance to the map center; show distance (and order) from the user.
  const bathrooms = useMemo(
    () =>
      (nearby.data ?? [])
        .map((b) => ({
          ...b,
          distance: user
            ? distanceMeters(user, { lat: b.latitude, lng: b.longitude })
            : b.distance,
        }))
        .sort((a, b) => a.distance - b.distance),
    [nearby.data, user],
  );

  /** Runs when the map stops moving: turns the visible region into the area to search. */
  const onRegionChangeComplete = (region: Region) => {
    regionRef.current = region;
    const values = [
      region.latitude,
      region.longitude,
      region.latitudeDelta,
      region.longitudeDelta,
    ];
    if (!values.every(Number.isFinite)) return; // never query with NaN
    setArea({
      lat: round(toValidLat(region.latitude), 4),
      lng: round(toValidLng(region.longitude), 4),
      radius: Math.min(
        MAX_RADIUS_M,
        Math.max(
          MIN_RADIUS_M,
          Math.round(regionRadiusMeters(region) / 100) * 100,
        ),
      ),
    });
  };

  /** Moves the map back to the user. */
  const goToUser = () => {
    if (!user) return;
    mapRef.current?.animateToRegion(
      {
        latitude: user.lat,
        longitude: user.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      400,
    );
  };

  /** Opens a bathroom in the detail sheet and centers the map on it. */
  const select = (bathroom: Bathroom) => {
    setSelected(bathroom);
    // Center the pin in the part of the map the bottom modal leaves visible.
    const delta = Math.min(regionRef.current?.latitudeDelta ?? 0.01, 0.02);
    mapRef.current?.animateToRegion(
      {
        latitude: bathroom.latitude - delta * 0.2,
        longitude: bathroom.longitude,
        latitudeDelta: delta,
        longitudeDelta: delta,
      },
      350,
    );
  };

  /** Shows who is signed in and asks before logging out. */
  const confirmSignOut = () => {
    const email = auth.status === "signedIn" ? auth.user.email : "";
    Alert.alert("Tu cuenta", `Sesión iniciada como ${email}`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: () => void signOut(),
      },
    ]);
  };

  if (location.isPending) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-canvas">
        <ActivityIndicator color={colors.brand[500]} size="large" />
        <Text className="text-muted">Buscando tu ubicación…</Text>
      </View>
    );
  }

  if (location.isError || !user) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-canvas px-8">
        <Ionicons name="location" size={48} color={colors.brand[500]} />
        <Text className="text-center text-base text-ink">
          Necesitamos tu ubicación para encontrar baños cerca de ti.
        </Text>
        <View className="w-full gap-3">
          <PrimaryButton
            label="Intentar de nuevo"
            onPress={() => location.refetch()}
          />
          <Pressable
            onPress={() => Linking.openSettings()}
            className="items-center py-2"
          >
            <Text className="font-semibold text-brand-600">Abrir ajustes</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={googleMapsEnabled ? PROVIDER_GOOGLE : undefined}
        customMapStyle={googleMapsEnabled ? mapStyle : undefined}
        initialRegion={{
          latitude: user.lat,
          longitude: user.lng,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {bathrooms.map((b) => (
          <BathroomMarker
            key={b.id}
            bathroom={b}
            selected={selected?.id === b.id}
            onPress={() => select(b)}
          />
        ))}
      </MapView>

      <View
        className="absolute left-4 right-4 flex-row items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-md"
        style={{ top: insets.top + 8 }}
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="water" size={20} color={colors.brand[500]} />
          <Text className="text-base font-semibold text-ink">
            Incluir de pago
          </Text>
        </View>
        <Switch
          value={includePaid}
          onValueChange={setIncludePaid}
          trackColor={{ false: colors.brand[200], true: colors.brand[500] }}
        />
      </View>

      <Pressable
        onPress={goToUser}
        className="absolute right-4 h-12 w-12 items-center justify-center rounded-full bg-white shadow-md active:bg-brand-50"
        style={{ top: insets.top + 76 }}
      >
        <Ionicons name="locate" size={22} color={colors.brand[600]} />
      </Pressable>

      <Pressable
        onPress={confirmSignOut}
        accessibilityLabel="Tu cuenta"
        className="absolute right-4 h-12 w-12 items-center justify-center rounded-full bg-white shadow-md active:bg-brand-50"
        style={{ top: insets.top + 136 }}
      >
        <Ionicons name="person" size={20} color={colors.brand[600]} />
      </Pressable>

      <NearbySheet
        bathrooms={bathrooms}
        loading={nearby.isPending}
        onSelect={select}
      />

      {nearby.isError ? (
        <View
          className="absolute left-4 right-20 rounded-2xl bg-danger px-4 py-3"
          style={{ top: insets.top + 76 }}
        >
          <Text className="font-medium text-white">
            {errorMessage(nearby.error)}
          </Text>
        </View>
      ) : null}

      <BathroomDetailSheet
        bathroom={selected}
        onClose={() => setSelected(null)}
      />
    </View>
  );
}
