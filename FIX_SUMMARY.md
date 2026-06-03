# Fix Summary

## Frontend Build Failure

- Issue found: `SettingsPage.tsx` imported unused Lucide icons.
- Root cause: TypeScript `noUnusedLocals` rejected unused imports.
- Fix applied: Removed unused imports.
- Verification performed: `npm run build` passed.

## ESLint Configuration Missing

- Issue found: `npm run lint` existed without an ESLint config.
- Root cause: Tooling script was configured before `.eslintrc` was added.
- Fix applied: Added `frontend/.eslintrc.cjs` for React, TypeScript, Vite, hooks, and refresh-safe linting.
- Verification performed: `npm run lint` passed.

## Frontend Test Runner

- Issue found: `npm test -- --run` failed because no test files existed.
- Root cause: Vitest was configured but had no matching tests.
- Fix applied: Added a small utility smoke test.
- Verification performed: `npm test -- --run` passed.

## Backend Test Runner

- Issue found: `pytest` was missing and local tests could not resolve Docker host `db`.
- Root cause: Local backend venv drifted from project requirements and pytest used development settings pointed at Docker networking.
- Fix applied: Installed targeted test packages, added `config.settings.test`, and pointed `pytest.ini` at test settings.
- Verification performed: `venv\Scripts\python.exe -m pytest` passed.

## Project Create API

- Issue found: Admin project create test returned 400 for JSON list `tech_stack`.
- Root cause: Serializer was configured for multipart JSON string parsing only.
- Fix applied: `tech_stack` now accepts normal JSON arrays and JSON-encoded strings.
- Verification performed: Backend pytest passed.

## Docker

- Issue found: Frontend Dockerfile used `npm ci --frozen-lockfile`.
- Root cause: `--frozen-lockfile` is not the npm equivalent.
- Fix applied: Replaced with `npm ci`.
- Verification performed: `docker compose config` exited successfully.

## Encoding Cleanup

- Issue found: Terminal output rendered Unicode separators as mojibake, but a raw search for corrupt `â`/`Ã` sequences did not find source corruption except legitimate localized French text.
- Root cause: Console rendering/codepage mismatch, not widespread file corruption.
- Fix applied: No destructive encoding rewrite was applied.
- Verification performed: `rg -n "â|Ã" . -g "!frontend/node_modules/**" -g "!backend/venv/**"` only flagged valid French copy.
