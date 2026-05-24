from .base import *  # noqa

DEBUG = True
ALLOWED_HOSTS = ["*"]

INTERNAL_IPS = ["127.0.0.1"]

# Always use console email in development — no SMTP calls, no credentials needed
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Disable cookie security so local HTTP sessions work
SIMPLE_JWT["AUTH_COOKIE_SECURE"] = False  # noqa: F405

# Relax CORS in dev — allows any origin including localhost:5173
CORS_ALLOW_ALL_ORIGINS = True

# Verbose logging in dev
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django.db.backends": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
    },
}
