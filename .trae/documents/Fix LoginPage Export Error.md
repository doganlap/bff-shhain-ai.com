## Root Cause

* `apps/web/src/App.jsx` imports `LoginPage` from `./pages`.

* `apps/web/src/pages/index.js` currently comments out all login exports, so it does not provide `LoginPage`.

* Browser error: `SyntaxError: The requested module '/src/pages/index.js' does not provide an export named 'LoginPage'`.

## Fix Options

1. Re-enable login exports in `apps/web/src/pages/index.js`:

   * Export `SimpleLoginPage`.

   * Add named aliases `LoginPage` and `GlassmorphismLoginPage` pointing to `SimpleLoginPage`.
2. Alternatively, change `apps/web/src/App.jsx` to import `SimpleLoginPage` from `../pages/auth/SimpleLoginPage.jsx` and update routes to use it, avoiding the central pages index.

## Recommended Approach

* Option 1 (re-enable exports) keeps centralized imports intact and minimizes changes. It aligns with existing usage in `App.jsx` and other modules.

## Implementation Steps

1. Edit `apps/web/src/pages/index.js`:

   * Uncomment or add:

     * `export { default as SimpleLoginPage } from './auth/SimpleLoginPage.jsx';`

     * `export { default as LoginPage } from './auth/SimpleLoginPage.jsx';`

     * `export { default as GlassmorphismLoginPage } from './auth/SimpleLoginPage.jsx';`
2. Ensure `/login` route references are consistent:

   * `apps/web/src/App.jsx` has `<Route path="/login" element={<LoginPage />} />` which will work once exports are restored.

   * `apps/web/src/config/routes.jsx` already points to `SimpleLoginPage`; optionally unify later to use `LoginPage` alias for consistency.

## Validation

* Start the frontend and navigate to `/login`; confirm no module export error.

* Confirm the login page renders and submission hits `/auth/login` via `apiServices.auth.login`.

* Verify protected routes redirect to `/login` when unauthenticated and allow access when authenticated.

## Rollback Plan

* If authentication is intentionally disabled for a specific deployment, keep exports but gate route usage via environment flags, or provide a stub `LoginPage` that redirects to landing.

