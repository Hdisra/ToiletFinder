import "../global.css";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SplashView } from "@/components/splash-view";
import { AuthProvider, useAuth } from "@/features/auth/auth-context";

// Keep the native splash screen until the saved session has been checked.
void SplashScreen.preventAutoHideAsync();

/** Cache and fetcher for all server data (TanStack Query). */
const queryClient = new QueryClient();

/** Chooses what to show: the app for signed-in users, the login screens for everyone else. */
function RootNavigator() {
  const { state } = useAuth();
  // Stack.Protected hides a group of screens (and redirects) unless its guard is true.
  const signedIn = state.status === "signedIn";

  // Hide the native splash once the saved session has been checked.
  useEffect(() => {
    if (state.status !== "loading") void SplashScreen.hideAsync();
  }, [state.status]);

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={signedIn} redirectTo="/login">
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn} redirectTo="/">
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      {state.status === "loading" ? <SplashView /> : null}
    </View>
  );
}

/** Root of the app: wraps everything with gestures, data cache, login state and bottom sheets. */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BottomSheetModalProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </BottomSheetModalProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
