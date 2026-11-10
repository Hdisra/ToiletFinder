/** localStorage key where the login token is saved. */
const KEY = 'admin-token'

/** Saved token, or null. localStorage can be unavailable (private mode, blocked cookies), so every function here fails soft. */
export const getStoredToken = () => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

/** Saves the token so the session survives a reload. */
export const storeToken = (token: string) => {
  try {
    localStorage.setItem(KEY, token)
  } catch {
    // The session just won't survive a reload.
  }
}

/** Removes the saved token (logout). */
export const clearStoredToken = () => {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nothing to clear.
  }
}
