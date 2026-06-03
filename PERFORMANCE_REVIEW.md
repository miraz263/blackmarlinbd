# Performance Review

## Analytics CSV Export

- Issue found: Blog view counts were queried inside the per-day CSV loop.
- Root cause: `PageView.objects.filter(...).count()` ran once per exported date.
- Fix applied: Blog views are now aggregated once with `TruncDate` and reused from a map.
- Verification performed: Backend pytest passed.

## Analytics Collection

- Issue found: The public analytics endpoint could receive high-volume spam submissions.
- Root cause: No endpoint-specific throttle was configured.
- Fix applied: Added scoped DRF throttling at 60 requests per minute.
- Verification performed: Backend `manage.py check` and pytest passed.

## Frontend Build

- Issue found: Production build was blocked by TypeScript unused imports.
- Root cause: Dashboard settings page imported icons that were not used.
- Fix applied: Removed unused imports.
- Verification performed: `npm run build` passed.

## Product Catalog Cleanup Review

- Issue found: `frontend/src/data/productCatalog.ts` was suspected legacy data.
- Root cause: Products are increasingly backend-backed, but static catalog code still exists.
- Finding: Active, not removable yet. It is imported by `ProductSuites.tsx` and `ProductDetailPage.tsx`.
- Recommendation: Migrate those consumers to the products API before deleting the static catalog.
