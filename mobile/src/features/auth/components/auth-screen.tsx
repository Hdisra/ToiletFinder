import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter, type Href } from "expo-router";
import type { ReactNode } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme";

/** Gradient header with the logo and a white card for the form, like the login mockup. */
export function AuthScreen({
  title,
  subtitle,
  showBack,
  switchPrompt,
  switchLabel,
  switchHref,
  children,
}: {
  title: string;
  subtitle: string;
  showBack?: boolean;
  /** Optional "no account? Sign up" style link at the top right. */
  switchPrompt?: string;
  switchLabel?: string;
  switchHref?: Href;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <LinearGradient
          colors={[colors.brand[700], colors.brand[500]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 12, paddingBottom: 56 }}
        >
          <View className="h-11 flex-row items-center justify-between px-5">
            {showBack ? (
              <Pressable onPress={() => router.back()} hitSlop={12}>
                <Ionicons name="chevron-back" size={26} color={colors.white} />
              </Pressable>
            ) : (
              <View />
            )}
            {switchHref ? (
              <View className="flex-row items-center gap-2">
                <Text className="text-sm text-white/80">{switchPrompt}</Text>
                <Link href={switchHref} asChild>
                  <Pressable className="rounded-xl bg-white/20 px-3 py-2 active:bg-white/30">
                    <Text className="text-sm font-semibold text-white">
                      {switchLabel}
                    </Text>
                  </Pressable>
                </Link>
              </View>
            ) : null}
          </View>

          <View className="mt-4 items-center gap-2">
            <Image
              source={require("../../../../assets/images/icon.png")}
              style={{ width: 64, height: 64, borderRadius: 16 }}
            />
            <Text className="text-3xl font-bold text-white">Toilet Finder</Text>
          </View>
        </LinearGradient>

        <View
          className="-mt-8 flex-1 rounded-t-[32px] bg-white px-6 pt-8"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          <Text className="text-center text-3xl font-bold text-ink">
            {title}
          </Text>
          <Text className="mb-6 mt-1 text-center text-base text-muted">
            {subtitle}
          </Text>
          <View className="gap-4">{children}</View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
