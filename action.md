Set DATABASE_URL (and any other secrets the BFF expects) in your Vercel project settings for Production, Preview, and Development. The value should be the same Postgres connection string you use locally. Once it’s present, trigger a redeploy so the serverless bundle can boot without crashing on startup.
If you want the function to survive missing DB access (e.g., for static-only routes), make parseEnv() tolerate an empty DATABASE_URL and only instantiate Prisma when a route actually needs it. That small guard lets /readyz or other lightweight endpoints run while still returning a clear 503 when DB-backed routes are hit.
Root Cause
The BFF loads ENV during module initialization. parseEnv() immediately throws when DATABASE_URL is absent, which prevents Vercel from ever instantiating the handler and yields FUNCTION_INVOCATION_FAILED for every request.
```7:10:apps/bff/config/env.js
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}
```7:10:apps/bff/config/env.jsconst DATABASE_URL = process.env.DATABASE_URL;if (!DATABASE_URL) {  throw new Error('DATABASE_URL environment variable is required');}

- Because `PrismaClient` is created during the same startup, the code path can never skip the DB requirement:

- Because `PrismaClient` is created during the same startup, the code path can never skip the DB requirement:
prisma.jsLines 3-7
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { PrismaClient } = require('@prisma/client');const prisma = new PrismaClient();

- Locally you have `.env`, so everything boots. In Vercel the env var isn’t defined yet, so the very first `require('./config/env')` throws before Express or any error handler can run. The platform surfaces that as a failed invocation.

### Concept

- Serverless platforms eagerly evaluate your module when the first request reaches a function. Any synchronous exception (missing env, syntax errors, unsupported native module) aborts the invocation, because Vercel can’t route the request to a handler that never finished loading. For safety Vercel halts the function instead of running with an undefined DB URL, which would risk hitting the wrong database or leaking data.

- Mental model: treat module top-level code as part of the cold-start handshake. It must complete quickly and without throwing; otherwise the platform tears down the process.

- In the broader Node/serverless ecosystem this pattern enforces “configuration is required before execution,” ensuring secrets are present and preventing half-initialized services from handling user traffic.

### Warning Signs

- Console logs like `DATABASE_URL: ✗ Missing` (emitted right before the throw in `config/env.js`) or `PrismaClientInitializationError` in Vercel logs indicate the handler died before serving traffic.

- Any `require`/`import` that immediately reads from `process.env` and throws (or calls `fs.readFileSync`) is a red flag for serverless environments.

- Similar mistakes: instantiating heavy DB clients at the top level without guarding for missing secrets, referencing local file paths (`./certs/key.pem`) that aren’t bundled, or performing synchronous network calls before the handler is defined.

### Alternatives & Trade-offs

- **Provide the env vars (recommended):** Keeps existing architecture, minimal code changes. Requires secure storage of DB credentials in Vercel and a database that Vercel can reach (consider managed providers like Neon/Supabase for stable connections).

- **Lazy-load Prisma / make DB optional:** Wrap `parseEnv()` and `new PrismaClient()` so they only run when a DB-backed route executes. This allows non-DB routes to function even if the database is down, but you still need the env var for anything that touches data.

- **Run the BFF outside Vercel (e.g., on a persistent VM or Fly.io) and have Vercel call it:** Removes the serverless cold-start/env constraints but adds infrastructure overhead and networking latency between frontend and BFF.

- **Split the function:** Keep lightweight proxy/auth logic in Vercel, move heavy Prisma operations into dedicated API routes or edge-friendly services. More complex deployment, but better isolates failures.

Implementing the env variable (or guarding the initialization path) will get rid of the *FUNCTION_INVOCATION_FAILED* errors and let you redeploy confidently.
- Locally you have `.env`, so everything boots. In Vercel the env var isn’t defined yet, so the very first `require('./config/env')` throws before Express or any error handler can run. The platform surfaces that as a failed invocation.### Concept- Serverless platforms eagerly evaluate your module when the first request reaches a function. Any synchronous exception (missing env, syntax errors, unsupported native module) aborts the invocation, because Vercel can’t route the request to a handler that never finished loading. For safety Vercel halts the function instead of running with an undefined DB URL, which would risk hitting the wrong database or leaking data.- Mental model: treat module top-level code as part of the cold-start handshake. It must complete quickly and without throwing; otherwise the platform tears down the process.- In the broader Node/serverless ecosystem this pattern enforces “configuration is required before execution,” ensuring secrets are present and preventing half-initialized services from handling user traffic.### Warning Signs- Console logs like `DATABASE_URL: ✗ Missing` (emitted right before the throw in `config/env.js`) or `PrismaClientInitializationError` in Vercel logs indicate the handler died before serving traffic.- Any `require`/`import` that immediately reads from `process.env` and throws (or calls `fs.readFileSync`) is a red flag for serverless environments.- Similar mistakes: instantiating heavy DB clients at the top level without guarding for missing secrets, referencing local file paths (`./certs/key.pem`) that aren’t bundled, or performing synchronous network calls before the handler is defined.### Alternatives & Trade-offs- **Provide the env vars (recommended):** Keeps existing architecture, minimal code changes. Requires secure storage of DB credentials in Vercel and a database that Vercel can reach (consider managed providers like Neon/Supabase for stable connections).- **Lazy-load Prisma / make DB optional:** Wrap `parseEnv()` and `new PrismaClient()` so they only run when a DB-backed route executes. This allows non-DB routes to function even if the database is down, but you still need the env var for anything that touches data.- **Run the BFF outside Vercel (e.g., on a persistent VM or Fly.io) and have Vercel call it:** Removes the serverless cold-start/env constraints but adds infrastructure overhead and networking latency between frontend and BFF.- **Split the function:** Keep lightweight proxy/auth logic in Vercel, move heavy Prisma operations into dedicated API routes or edge-friendly services. More complex deployment, but better isolates failures.Implementing the env variable (or guarding the initialization path) will get rid of the *FUNCTION_INVOCATION_FAILED* errors and let you redeploy confidently.
