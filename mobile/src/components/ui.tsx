import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import type { ComponentProps } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { colors } from "@/theme";

/** Names of the available icons. */
type IconName = ComponentProps<typeof Ionicons>["name"];

/** Main blue button. Shows a spinner while `loading`; neither state can be pressed. */
export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className="overflow-hidden rounded-2xl active:opacity-80 disabled:opacity-40"
    >
      <LinearGradient
        colors={[colors.brand[600], colors.brand[400]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          paddingVertical: 16,
        }}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : icon ? (
          <Ionicons name={icon} size={20} color={colors.white} />
        ) : null}
        <Text className="text-base font-semibold text-white">{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

/** Small read-only label. */
export function Badge({
  label,
  icon,
  tone = "brand",
}: {
  label: string;
  icon?: IconName;
  tone?: "brand" | "free" | "paid";
}) {
  const color =
    tone === "free"
      ? colors.free
      : tone === "paid"
        ? colors.paid
        : colors.brand[700];
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5">
      {icon ? <Ionicons name={icon} size={14} color={color} /> : null}
      <Text className="text-xs font-semibold" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}
