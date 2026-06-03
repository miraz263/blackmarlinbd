# Security Review

## Logout Cookie Deletion

- Issue found: Refresh cookie was created at `/api/v1/auth/token/refresh/` but cleared at `/`.
- Root cause: Cookie deletion path did not match cookie creation path.
- Fix applied: Access and refresh cookies are now expired with their exact original paths.
- Verification performed: Backend tests passed; code review confirms `HttpOnly`, `Secure`, and `SameSite` are preserved during deletion.

## Redis Healthcheck Authentication

- Issue found: Redis required a password, but healthcheck used unauthenticated `redis-cli ping`.
- Root cause: Healthcheck did not use the configured Redis password.
- Fix applied: Redis service now exposes `REDIS_PASSWORD` to the container and healthcheck uses authenticated `redis-cli`.
- Verification performed: `docker compose config` exited successfully.

## Analytics Spam Protection

- Issue found: Public analytics collection endpoint accepted unauthenticated writes without endpoint-specific throttling.
- Root cause: The endpoint used `AllowAny` and disabled authentication, relying only on generic framework defaults.
- Fix applied: Added DRF scoped throttling with `analytics_collect: 60/minute`.
- Verification performed: Backend `manage.py check` and pytest passed.

## Remaining Security Notes

- `docker compose config` warns about an unset `A` variable from the local ignored `.env`; review secret values containing `$` and escape them as `$$` in `.env` if Compose interpolation is unintended.
- Real `.env` files remain ignored and were not committed.
