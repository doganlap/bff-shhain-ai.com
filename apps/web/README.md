# Web App placeholder

Use this folder for Next.js (or other) frontends. Keep UI Kit and i18n centralized.

## Production Deployment Notes

- **Canonical BFF URL**: The frontend talks to the backend exclusively via `https://grc-backend.shahin-ai.com` (BFF / API gateway).
- **CSP `connect-src`**: The HTML entry (`index.html`) Content-Security-Policy allows `connect-src` only to `self`, `https://grc-backend.shahin-ai.com` (and its `wss://` variant), and the main Shahin domains.
- **Domain Enforcement**: In production builds, the React app enforces `window.location.host === 'www.shahin-ai.com'` and redirects any other host to `https://www.shahin-ai.com` while preserving path and query.
- **Login Flow Rule**: All authentication flows must start from `/` on `https://www.shahin-ai.com`. Direct access to internal routes (e.g. `/app`, `/advanced`, `/tenant/...`) is wrapped by `ProtectedRoute` and redirects unauthenticated users back to `/`.
- **Backend Login Origin Check**: The BFF `/api/auth/login` endpoint only accepts requests with `Origin: https://www.shahin-ai.com` in production and returns `403` for other origins.

