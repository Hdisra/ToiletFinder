/** User data returned by the API. */
export interface User {
  id: number;
  email: string;
}

/** Result of a login or sign-up: the token to send in every request, and its user. */
export interface Session {
  token: string;
  user: User;
}
