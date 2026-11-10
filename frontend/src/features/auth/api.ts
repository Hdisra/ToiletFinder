import { api } from "@/api/client";
import type { AuthUser, Session } from "./types";

/** POST with a JSON body. Shared by the calls below. */
const post = <T>(path: string, body: unknown) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body) });

/** Logs in; returns the token and the user. */
export const login = (credentials: { email: string; password: string }) =>
  post<Session>("/auth/login", credentials);

/** The user that owns the saved token (used to restore the session). */
export const fetchMe = () => api<AuthUser>("/auth/me");

/** Asks the server to email a 6-digit reset code. */
export const forgotPassword = (email: string) =>
  post<void>("/auth/forgot-password", { email });

/** Sets a new password using the emailed code. */
export const resetPassword = (data: {
  email: string;
  code: string;
  newPassword: string;
}) => post<void>("/auth/reset-password", data);
