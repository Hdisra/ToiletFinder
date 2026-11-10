import { useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setAccessToken, setUnauthorizedHandler } from "@/api/client";
import { fetchMe } from "./api";
import { clearStoredToken, getStoredToken, storeToken } from "./token-storage";
import type { Session } from "./types";
import { AuthContext, type AuthState } from "./use-auth";

/** Holds the login state for the whole app: restores the saved session, and exposes `signIn` / `signOut` through `useAuth`. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // loading = checking the saved token, signedOut = no session, signedIn = admin logged in.
  // Without a saved token there is nothing to restore.
  const [state, setState] = useState<AuthState>(() =>
    getStoredToken() ? { status: "loading" } : { status: "signedOut" },
  );

  /** Forgets the session: token, cached data and login state. */
  const signOut = useCallback(() => {
    setAccessToken(null);
    clearStoredToken();
    queryClient.clear(); // nothing from the previous session stays cached
    setState({ status: "signedOut" });
  }, [queryClient]);

  /** Saves the session after a successful login. */
  const signIn = useCallback(({ token, user }: Session) => {
    storeToken(token);
    setAccessToken(token);
    setState({ status: "signedIn", user });
  }, []);

  // Sign out when the server stops accepting the token (expired or revoked).
  useEffect(() => {
    setUnauthorizedHandler(signOut);
    return () => setUnauthorizedHandler(undefined);
  }, [signOut]);

  // Restore the session saved in this browser.
  useEffect(() => {
    let cancelled = false;
    const token = getStoredToken();
    if (!token) return;

    setAccessToken(token);
    fetchMe()
      .then((user) => {
        if (cancelled) return;
        if (user.role === "admin") setState({ status: "signedIn", user });
        else signOut();
      })
      .catch(() => {
        if (!cancelled) signOut();
      });
    return () => {
      cancelled = true;
    };
  }, [signOut]);

  // Memoized so consumers re-render only when the state changes.
  const value = useMemo(
    () => ({ state, signIn, signOut }),
    [state, signIn, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
