from .base import *  # noqa

DEBUG = True
ALLOWED_HOSTS = ["*"]


INTERNAL_IPS = ["127.0.0.1"]

# Use console email in development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Disable cookie security in development
SIMPLE_JWT["AUTH_COOKIE_SECURE"] = False  # noqa

# Relax CORS in dev
CORS_ALLOW_ALL_ORIGINS = True
