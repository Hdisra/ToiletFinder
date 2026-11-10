# Toilet Finder

Mobile app to find free bathrooms near you (malls, supermarkets, parks, …) on a map, see how far they are, and rate them from 1 to 10. A switch includes bathrooms that cost money. The app is in Spanish. Users sign up with an email and a password (Google/Apple sign-in is planned).

Users can't add bathrooms from the app: the owner adds them (and moderates ratings) in the admin web app.

| Folder | What | Stack |
|---|---|---|
| `backend/` | REST API | NestJS (Express), TypeScript, TypeORM, MySQL |
| `mobile/` | Mobile app | Expo (React Native), NativeWind, TanStack Query |
| `frontend/` | Admin web app | React, TypeScript, Vite, Tailwind, TanStack Query, Leaflet |
| `docker-compose.yml` | Local MySQL and a mail catcher | MySQL 8.4, Mailpit |

## Requirements

- Node.js (tested with 24.11) and [pnpm](https://pnpm.io) (tested with 11)
- Docker (for MySQL)
- For the mobile app: a physical device with Expo Go, or Xcode (iOS simulator) / Android Studio (Android emulator)

## Run it

### 1. Database

```bash
docker compose up -d
```

MySQL listens on host port **3308** (user/password/database: `bathroomfinder`).
Mailpit catches the emails the backend sends (password reset codes): open http://localhost:8025 to read them.

### 2. Backend

```bash
cd backend
cp .env.example .env
pnpm install
pnpm start:dev
```

Before starting, set `JWT_SECRET` in `backend/.env` to a long random value, for example the output of `openssl rand -base64 48`. The backend refuses to start if it is shorter than 32 characters or still `change-me`.

API: `http://localhost:3000/api` — check `http://localhost:3000/api/health`.
Tables are created automatically (`DB_SYNCHRONIZE=true`, development only).

### 3. Admin web app

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm dev
```

Open http://localhost:5173. `VITE_API_URL` (in `frontend/.env`) must point at the backend, and `CORS_ORIGIN` in `backend/.env` must contain the web app's address (`http://localhost:5173` by default).

**Create the admin account** (only one is needed; there is no sign-up in the web app). In `backend/.env` set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (8+ characters), then:

```bash
cd backend
pnpm admin:create
```

If that email already has an account (for example from the mobile app), it is promoted to admin and its password is not changed. After creating it you can empty `ADMIN_PASSWORD` in `.env`. Use **¿Olvidaste tu contraseña?** to change the password later.

### 4. Mobile

In a second terminal:

```bash
cd mobile
cp .env.example .env
pnpm install
pnpm ios        # or: pnpm android
```

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to match where the app runs:

- iOS simulator: `http://localhost:3000/api`
- Android emulator: `http://10.0.2.2:3000/api`
- Physical device: `http://<your-computer-LAN-IP>:3000/api`

Restart `pnpm ios` / `pnpm android` after changing `.env`. On a physical device, the phone and the computer must be on the same Wi-Fi.

### Maps

- **Expo Go (no setup):** Android shows Google Maps, iOS shows Apple Maps. No key needed.
- **Google Maps on iOS, or your own key** needs a development build (Expo Go can't use it):
  1. In [Google Cloud](https://console.cloud.google.com), create a project and enable billing (required by Google; its docs say mobile Maps SDK usage is unlimited), then enable *Maps SDK for Android* and/or *Maps SDK for iOS*.
  2. Create API keys and restrict them to this app.
  3. Put them in `mobile/.env`: `GOOGLE_MAPS_ANDROID_API_KEY`, `GOOGLE_MAPS_IOS_API_KEY`, and set `EXPO_PUBLIC_IOS_GOOGLE_MAPS=true` for iOS.
  4. Build: `pnpm dev-build:ios` or `pnpm dev-build:android` (needs Xcode / Android Studio; not tested here).

## Admin web app

- **Panel:** totals, ratings per day (a count above each bar, grouped by your own local days), bathrooms by category, score distribution and the latest ratings.
- **Baños:** list with search. Edit a bathroom (any field, including moving its pin) or delete it; deleting also deletes its ratings.
- **Agregar baño:** form plus a map. The map starts at your current location (the browser asks for permission; it works on `localhost` or HTTPS). Click the map or drag the pin to set the exact spot; the search box finds an address. A bathroom can't be placed within 20 m of another one.
- **Calificaciones:** list with search; edit the score or comment of any rating, or delete it (the bathroom's average is recalculated).
- **Map:** [Leaflet](https://leafletjs.com) with OpenStreetMap tiles, free and without an API key. Google Maps for the web needs a billing-enabled project even within its free allowance. The tiles and the address search (Nominatim) are meant for light use, which fits one admin; keep the on-map credit.

## Using the app

- **Sign up** with an email and a password (8+ characters), or **log in**. The session stays on the phone until you tap the account button on the map and choose **Cerrar sesión**.
- **¿Olvidaste tu contraseña?** emails a 6-digit code (valid 15 minutes). Locally, read it in Mailpit (http://localhost:8025). Enter it in the app with a new password.
- The map shows bathrooms around the area you are looking at; **Include paid** shows the ones that cost money.
- Drag the **Más cercanos a ti** panel up for the list. Tap a pin or a row to open its details: rating, reviews, directions and a form to rate it.
- Each user has one rating per bathroom. Open the bathroom again to change it (**Tu calificación** → **Actualizar calificación**).

### Icon and splash screen

Expo Go always shows its own icon and splash screen. To see yours, make a development build (`pnpm dev-build:ios` or `pnpm dev-build:android`). While the saved session loads, the app also shows the splash image itself.

## Add bathrooms

Use **Agregar baño** in the admin web app. The route behind it, `POST /api/bathrooms`, only accepts an admin's token:

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"<admin email>","password":"<admin password>"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

curl -X POST http://localhost:3000/api/bathrooms \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Central Mall - Level 1","category":"mall","latitude":19.4326,"longitude":-99.1332}'
```

(Use coordinates close to your location. In the iOS simulator: Features → Location.)

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/bathrooms?lat=&lng=&radius=2000&includePaid=false` | Nearby bathrooms, closest first (`radius` in meters) |
| GET | `/api/bathrooms/:id` | One bathroom |
| POST | `/api/bathrooms` | Create a bathroom. **Admin only** (`409` with `code: BATHROOM_TOO_CLOSE` if another one is within 20 m) |
| GET | `/api/bathrooms/:id/ratings` | Latest ratings of a bathroom (up to 50) |
| GET | `/api/bathrooms/:id/ratings/mine` | The rating of the logged-in user (`404` if none). Needs login |
| PUT | `/api/bathrooms/:id/ratings/mine` | Create or update the rating of the logged-in user (`score` 1–10, optional `comment`). Needs login |
| POST | `/api/auth/register` | `{ email, password }` → `{ token, user }` (`409` `EMAIL_TAKEN` if it exists) |
| POST | `/api/auth/login` | `{ email, password }` → `{ token, user }` (`401` `INVALID_CREDENTIALS`) |
| GET | `/api/auth/me` | The logged-in user. Needs login |
| POST | `/api/auth/forgot-password` | `{ email }` → `204`. Emails a code if the account exists (same answer if not) |
| POST | `/api/auth/reset-password` | `{ email, code, newPassword }` → `204` (`400` `INVALID_CODE`). Logs the user out everywhere |
| GET | `/api/admin/stats?tzOffset=-360` | Dashboard numbers and chart data; `tzOffset` is your UTC offset in minutes, so ratings are counted per local day. Admin only |
| GET | `/api/admin/bathrooms?page=&pageSize=&search=` | Paginated bathroom list. Admin only |
| PATCH | `/api/admin/bathrooms/:id` | Edit any of name, category, address (`null` removes it), cost, price, location (same 20 m rule, ignoring itself). Admin only |
| DELETE | `/api/admin/bathrooms/:id` | Delete a bathroom and its ratings. Admin only |
| GET | `/api/admin/ratings?page=&pageSize=&search=` | Paginated ratings with bathroom and user. Admin only |
| PATCH | `/api/admin/ratings/:id` | Edit `score` and/or `comment` (`null` removes it). Admin only |
| DELETE | `/api/admin/ratings/:id` | Delete a rating. Admin only |

"Needs login" means the header `Authorization: Bearer <token>`. Auth routes are limited to 10 requests per minute per IP. Timestamps are stored and returned in UTC (MySQL in Docker runs in UTC); the web app shows them in your local time.

## Security

What the backend does:

- **SQL injection:** every query uses TypeORM parameters (never string concatenation), and every input is validated first (types, ranges, lengths; unknown fields are rejected with 400).
- **Passwords:** hashed with scrypt; reset codes are 6 digits, stored hashed, valid 15 minutes, 5 attempts, and one code per account per minute.
- **Tokens:** HS256 JWT, 30-day expiry by default (`JWT_EXPIRES_IN`); the role is always read from the database, never from the token. Changing a password revokes the older tokens.
- **Limits:** 120 requests/minute per IP in general, 10/minute on login, register and password routes; JSON bodies over 16 KB are refused.
- **Headers and CORS:** `helmet` headers; only the origins in `CORS_ORIGIN` are allowed.
- **Docker:** MySQL and Mailpit only listen on `127.0.0.1`, so other devices on your network can't reach them. The MySQL passwords in `docker-compose.yml` are for development only.

What the admin web app does:

- **No injected HTML:** names, comments and emails are always rendered as text (React escapes them); the app never uses `dangerouslySetInnerHTML`.
- **Same limits as the API:** inputs have the same maximum lengths, the price and score rules match the backend, and map coordinates are kept inside valid ranges. The API still validates everything again.
- **Content-Security-Policy:** the production build (`pnpm build`) adds a policy that only allows this app's scripts and connections to the API, OpenStreetMap tiles and the place search. It is not applied in `pnpm dev`.
- **Login token:** it is kept in `localStorage` (the admin app and the API are on different origins), so it is readable by any script that runs in the page. The policy above and avoiding HTML injection are the protection; log out on shared computers.
- **Only admins:** the route guards are for convenience; the API is what enforces the admin role on every request.

What the mobile app does:

- **Token storage:** the login token is kept in the phone's secure storage (iOS Keychain / Android Keystore), not in plain files, and on iOS it stays on that device (not in backups).
- **HTTPS only in production:** a production build refuses to start if `EXPO_PUBLIC_API_URL` doesn't start with `https://`, so the token is never sent in clear text. (In development `http://` is allowed.)
- **Inputs:** email and password fields have the same maximum lengths as the API, the reset screen accepts only one valid email from its link, and a form can't be sent twice while a request is running.
- **Location privacy:** only the foreground location permission is requested, and coordinates are rounded (about 10 m) before they are sent to the API.
- **Public settings only:** `EXPO_PUBLIC_*` variables are bundled into the app, so they hold nothing secret.

Before going to production:

1. Set `NODE_ENV=production` and a strong `JWT_SECRET`. Use `DB_SYNCHRONIZE=false` (the backend refuses `true` in production) and create the tables with migrations.
2. Serve everything over HTTPS and set `CORS_ORIGIN` to the real admin web URL only.
   Also send these headers from the web server that hosts `frontend/dist`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and `Content-Security-Policy: frame-ancestors 'none'` (a page can't set that last one itself). Set `VITE_API_URL` to the `https://` API address before building, because the policy allows that address only.
3. If the backend is behind a reverse proxy, set `TRUST_PROXY_HOPS` (usually `1`); without it all users share one rate-limit counter.
4. Use your own database user and password, and a real SMTP server instead of Mailpit.
   For the mobile app, restrict the Google Maps keys to the app's package name / bundle ID in the Google Cloud console (the keys are readable inside the built app), and set `EXPO_PUBLIC_API_URL` to the `https://` API address before building.
5. Rate limits are kept in memory: with more than one backend instance, move them to a shared store (for example Redis).

## Useful commands

```bash
# backend/
pnpm test         # unit tests
pnpm lint
pnpm build

# frontend/
pnpm build        # type-checks and builds
pnpm lint

# mobile/
pnpm typecheck
```

## License

Copyright (c) 2026 Israel. All rights reserved. The code is public so it can be read and reviewed, but it may not be used, copied or distributed without permission. See [LICENSE](LICENSE).

## Security

To report a vulnerability, see [SECURITY.md](SECURITY.md).
