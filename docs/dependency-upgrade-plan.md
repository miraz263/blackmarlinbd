# Dependency Upgrade Plan

## Frontend Audit

Command run: `npm install`

Result: 649 packages audited, 0 vulnerabilities found.

Command run: `npm outdated`

## Safe Patch Upgrades

These stay within the current major version and should be low risk:

- `@tanstack/react-query` / `@tanstack/react-query-devtools`: 5.97.0 -> 5.101.0
- `autoprefixer`: 10.4.27 -> 10.5.0
- `axios`: 1.15.0 -> 1.16.1
- `postcss`: 8.5.9 -> 8.5.15
- `prettier`: 3.8.2 -> 3.8.3
- `react-hook-form`: 7.72.1 -> 7.77.0
- `@types/react`: 18.3.28 -> 18.3.30
- `@types/node`: 20.19.39 -> 20.19.41

## Minor Upgrades

These may include behavior changes but are still within the current major line:

- No urgent minor-only framework upgrades were required for this fix pass.

## Major Upgrades

Do not batch these into the production repair release. Schedule them with focused migration testing:

- React / React DOM: 18.3.1 -> 19.2.7
- React Router DOM: 6.30.3 -> 7.16.0
- Vite: 5.4.21 -> 8.0.16
- Vitest: 1.6.1 -> 4.1.8
- ESLint: 8.57.1 -> 10.4.1
- `@typescript-eslint/*`: 6.21.0 -> 8.60.1
- Tailwind CSS: 3.4.19 -> 4.3.0
- Zustand: 4.5.7 -> 5.0.14
- Zod: 3.25.76 -> 4.4.3
- Lucide React: 0.312.0 -> 1.17.0
- Framer Motion: 11.18.2 -> 12.40.0
- `@headlessui/react`: 1.7.19 -> 2.2.10
- `@hookform/resolvers`: 3.10.0 -> 5.4.0

## Recommendation

Apply patch upgrades first, then retest `npm run lint`, `npm run build`, and `npm test -- --run`.

Major upgrades should be split by subsystem: React/router, Vite/Vitest, Tailwind, then form/state/schema libraries.
