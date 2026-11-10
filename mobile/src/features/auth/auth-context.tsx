import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError, setAccessToken, setUnauthorizedHandler } from "@/api/client";
import { fetchMe } from "./api";
import { clearStoredToken, getStoredToken, storeToken } from "./token-storage";
import type { Session, User } from "./types";

/** Where the login stands: checking the saved token, logged out, or logged in as `user`. */
type AuthState =
  | { status: "loading" }
  | { status: "signedOut" }
  | { status: "signedIn"; user: User };

/** What `useAuth` gives to components. */
interface AuthContextValue {
  state: AuthState;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
}

/** React context filled by `AuthProvider`. */
const AuthContext = createContext<AuthContextValue | null>(null);

/** Holds the login state of the whole app: restores the saved session and exposes `signIn` / `signOut` through `useAuth`. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({ status: "loading" });

  /** Forgets the session: token, cached data and login state. */
  const signOut = useCallback(async () => {
    setAccessToken(null);
    await clearStoredToken();
    queryClient.clear(); // nothing of the previous user stays cached
    setState({ status: "signedOut" });
  }, [queryClient]);

  /** Saves the session after a successful login or sign-up. */
  const signIn = useCallback(async ({ token, user }: Session) => {
    await storeToken(token);
    setAccessToken(token);
    setState({ status: "signedIn", user });
  }, []);

  // Sign out when the server stops accepting the token (expired or revoked).
  useEffect(() => {
    setUnauthorizedHandler(() => void signOut());
    return () => setUnauthorizedHandler(undefined);
  }, [signOut]);

  // Restore the session saved on this phone.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const token = await getStoredToken().catch(() => null);
      if (!token) return !cancelled && setState({ status: "signedOut" });

      setAccessToken(token);
      try {
        const user = await fetchMe();
        if (!cancelled) setState({ status: "signedIn", user });
      } catch (error) {
        // Only forget the token if the server rejected it; if the server was
        // just unreachable, the next launch can still use it.
        if (error instanceof ApiError && error.status === 401) {
          await signOut();
        } else if (!cancelled) {
          setAccessToken(null);
          setState({ status: "signedOut" });
        }
      }
    })();
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

/** Login state and actions. Must be used inside `AuthProvider`. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
