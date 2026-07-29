from .base import *

DEBUG = False

ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default=".onrender.com",
    cast=lambda v: [s.strip() for s in v.split(",")],
)

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DATABASE_NAME"),
        "USER": config("DATABASE_USER"),
        "PASSWORD": config("DATABASE_PASSWORD"),
        "HOST": config("DATABASE_HOST"),
        "PORT": config("DATABASE_PORT", default="5432"),
        "OPTIONS": {
            "sslmode": "require",
        },
    }
}

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
