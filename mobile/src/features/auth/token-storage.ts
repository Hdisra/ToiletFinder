import * as SecureStore from "expo-secure-store";

/** Name under which the token is saved in the phone's secure storage (Keychain / Keystore). */
const KEY = "access-token";

/** Saved token, or null. */
export const getStoredToken = () => SecureStore.getItemAsync(KEY);
/** Saves the token so the session survives closing the app. */
// iOS: the token stays on this device (not in backups or other devices) and is readable only while it is unlocked.
export const storeToken = (token: string) =>
  SecureStore.setItemAsync(KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
/** Removes the saved token (logout). */
export const clearStoredToken = () => SecureStore.deleteItemAsync(KEY);
