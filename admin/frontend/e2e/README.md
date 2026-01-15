# E2E Testing

Playwright end-to-end tests for the admin frontend.

## Authentication

Authentication uses Playwright's
[storageState](https://playwright.dev/docs/auth) pattern:

- **CI**: Auth state passed via `E2E_ADMIN_STORAGE_STATE` and
  `E2E_VIEWER_STORAGE_STATE` secrets
- **Local**: Loaded from `.env` file (run capture script to generate)

### Generating auth state

To capture fresh auth state (tokens expire periodically):

```bash
# Run the capture utility via npm
npm run e2e:capture-auth
```

This logs in via Microsoft and saves:

- `.auth/admin-storage-state.json`
- `.auth/viewer-storage-state.json`

Then minify and add to `.env`:

```bash
echo "E2E_ADMIN_STORAGE_STATE=$(cat .auth/admin-storage-state.json | jq -c '.')" >> .env
echo "E2E_VIEWER_STORAGE_STATE=$(cat .auth/viewer-storage-state.json | jq -c '.')" >> .env
```

For GitHub secrets, paste the raw JSON.

## Running tests

```bash
npx playwright test          # Run all tests
npx playwright test --headed # Run with visible browser
npx playwright test --ui     # Run with UI mode
```
