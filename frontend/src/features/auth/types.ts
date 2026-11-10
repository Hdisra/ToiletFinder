/** User data returned by the API. */
export interface AuthUser {
  id: number
  email: string
  role: 'user' | 'admin'
}

/** Result of a login: the JWT to send in every request, and its user. */
export interface Session {
  token: string
  user: AuthUser
}
