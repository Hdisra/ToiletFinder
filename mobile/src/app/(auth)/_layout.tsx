import { Stack } from "expo-router";

/** Stack of the logged-out screens (login, register, forgot and reset password). */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
