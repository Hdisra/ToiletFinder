const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL is not set. Copy .env.example to .env.");
}

export class ApiError extends Error {
  /** HTTP status, or 0 when the server could not be reached. */
  status: number;
  /** Machine-readable error code sent by the API, if any. */
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

let accessToken: string | null = null;
let onUnauthorized: (() => void) | undefined;

/** Token sent as `Authorization: Bearer` on every request. */
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

/** Called when the API rejects the stored token (expired or revoked). */
export const setUnauthorizedHandler = (handler: (() => void) | undefined) => {
  onUnauthorized = handler;
};

/** Calls the API with JSON and the login token. Throws `ApiError` on any failure. */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  // `Headers` merges any kind of header input; the login token is always set last so a caller can't replace it.
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, "Network request failed");
  }

  if (!res.ok) {
    // A 401 with a token means the session is no longer valid. Without a token
    // (login) it just means wrong credentials.
    if (res.status === 401 && accessToken) onUnauthorized?.();

    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : body?.message;
    throw new ApiError(res.status, message ?? res.statusText, body?.code);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
