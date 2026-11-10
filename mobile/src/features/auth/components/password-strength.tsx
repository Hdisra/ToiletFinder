import { Text, View } from "react-native";
import { colors } from "@/theme";

/** The three strength levels with their label and color. */
const LEVELS = [
  { label: "Débil", color: colors.danger },
  { label: "Media", color: colors.paid },
  { label: "Fuerte", color: colors.free },
] as const;

/** 0 (weak) to 2 (strong). Advisory only: the server just requires 8+ characters. */
function strengthOf(password: string) {
  const points =
    Number(password.length >= 8) +
    Number(password.length >= 12) +
    Number(/[a-z]/.test(password) && /[A-Z]/.test(password)) +
    Number(/\d/.test(password)) +
    Number(/[^A-Za-z0-9]/.test(password));
  return points >= 4 ? 2 : points >= 3 ? 1 : 0;
}

/** Colored bar and word showing how strong the typed password looks. */
export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const level = strengthOf(password);
  const { label, color } = LEVELS[level];

  return (
    <View className="flex-row items-center gap-2 px-1">
      <View className="flex-row gap-1">
        {LEVELS.map((_, i) => (
          <View
            key={i}
            className="h-1.5 w-8 rounded-full"
            style={{ backgroundColor: i <= level ? color : colors.brand[100] }}
          />
        ))}
      </View>
      <Text className="text-xs font-semibold" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}
