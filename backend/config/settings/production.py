from .base import *  # noqa: F401,F403

# ─── CORS ─────────────────────────────────────────────────────
# Wildcard MUST be off in production — explicit allow-list only.
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "https://blackmarlinbd.com",
        "https://www.blackmarlinbd.com",
    ],
)
CORS_ALLOW_CREDENTIALS = True

# ─── CSRF ─────────────────────────────────────────────────────
CSRF_TRUSTED_ORIGINS = env.list(
    "CSRF_TRUSTED_ORIGINS",
    default=[
        "https://blackmarlinbd.com",
        "https://www.blackmarlinbd.com",
    ],
)
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = "Lax"
# Keep CSRF_COOKIE_HTTPONLY=False (Django default) so JS can read
# the token for AJAX requests — httpOnly=True would break AJAX CSRF.
CSRF_COOKIE_HTTPONLY = False

# ─── Session cookies ──────────────────────────────────────────
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"

# ─── HSTS + SSL ───────────────────────────────────────────────
# All values overridable via env so a first-deploy test (HTTP only)
# can disable HSTS without touching this file.
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
SECURE_HSTS_SECONDS = env.int("SECURE_HSTS_SECONDS", default=31536000)
SECURE_HSTS_INCLUDE_SUBDOMAINS = env.bool("SECURE_HSTS_INCLUDE_SUBDOMAINS", default=True)
SECURE_HSTS_PRELOAD = env.bool("SECURE_HSTS_PRELOAD", default=True)
# Required when Django sits behind a reverse proxy that terminates SSL
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# ─── Security headers (django --deploy check) ─────────────────
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
X_FRAME_OPTIONS = "DENY"
# SECURE_BROWSER_XSS_FILTER removed in Django 5+; keep for 4.x compatibility
SECURE_BROWSER_XSS_FILTER = True

# ─── JWT cookie hardening (inherits from base.py SIMPLE_JWT) ──
# AUTH_COOKIE_SECURE is already True by default from base.py;
# override here to be explicit and environment-independent.
SIMPLE_JWT["AUTH_COOKIE_SECURE"] = True  # noqa: F405
SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"] = True  # noqa: F405
SIMPLE_JWT["AUTH_COOKIE_SAMESITE"] = "Lax"  # noqa: F405

# ─── Sentry (only initialises when DSN is set) ────────────────
SENTRY_DSN = env("SENTRY_DSN", default="")
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.celery import CeleryIntegration
    from sentry_sdk.integrations.redis import RedisIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration(), CeleryIntegration(), RedisIntegration()],
        traces_sample_rate=0.1,
        send_default_pii=False,
    )

# ─── Storage ──────────────────────────────────────────────────
# STORAGE_BACKEND env: local (default) | s3 | r2
# Legacy: USE_S3=True is equivalent to STORAGE_BACKEND=s3
STORAGE_BACKEND = env("STORAGE_BACKEND", default="local")
USE_S3 = env.bool("USE_S3", default=False)

if USE_S3 or STORAGE_BACKEND == "s3":
    # AWS S3
    AWS_ACCESS_KEY_ID = env("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = env("AWS_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME = env("AWS_STORAGE_BUCKET_NAME")
    AWS_S3_REGION_NAME = env("AWS_S3_REGION_NAME", default="us-east-1")
    AWS_S3_CUSTOM_DOMAIN = f"{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com"
    AWS_DEFAULT_ACL = "public-read"
    AWS_S3_OBJECT_PARAMETERS = {"CacheControl": "max-age=86400"}
    DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
    STATICFILES_STORAGE = "storages.backends.s3boto3.S3StaticStorage"
    STATIC_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/static/"
    MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/media/"

elif STORAGE_BACKEND == "r2":
    # Cloudflare R2 (S3-compatible)
    R2_ACCOUNT_ID = env("R2_ACCOUNT_ID")
    AWS_ACCESS_KEY_ID = env("R2_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = env("R2_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME = env("R2_BUCKET_NAME")
    AWS_S3_ENDPOINT_URL = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
    AWS_S3_REGION_NAME = "auto"
    AWS_DEFAULT_ACL = None
    AWS_S3_OBJECT_PARAMETERS = {"CacheControl": "max-age=86400"}
    DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
    STATICFILES_STORAGE = "storages.backends.s3boto3.S3StaticStorage"
    R2_CUSTOM_DOMAIN = env("R2_CUSTOM_DOMAIN", default="")
    if R2_CUSTOM_DOMAIN:
        STATIC_URL = f"https://{R2_CUSTOM_DOMAIN}/static/"
        MEDIA_URL = f"https://{R2_CUSTOM_DOMAIN}/media/"
    else:
        STATIC_URL = f"{AWS_S3_ENDPOINT_URL}/{AWS_STORAGE_BUCKET_NAME}/static/"
        MEDIA_URL = f"{AWS_S3_ENDPOINT_URL}/{AWS_STORAGE_BUCKET_NAME}/media/"

# local storage: STATIC_URL, STATIC_ROOT, MEDIA_URL, MEDIA_ROOT
# are already set in base.py — no override needed.

# ─── Logging ──────────────────────────────────────────────────
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}
