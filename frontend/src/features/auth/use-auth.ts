import { createContext, useContext } from 'react'
import type { AuthUser, Session } from './types'

/** Where the login stands: checking the saved token, logged out, or logged in as `user`. */
export type AuthState =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; user: AuthUser }

/** What `useAuth` gives to components. */
export interface AuthContextValue {
  state: AuthState
  signIn: (session: Session) => void
  signOut: () => void
}

/** React context filled by `AuthProvider`. */
export const AuthContext = createContext<AuthContextValue | null>(null)

/** Login state and actions. Must be used inside `AuthProvider`. */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
