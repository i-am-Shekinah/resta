from .base import *

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

CORS_ALLOW_ALL_ORIGINS = True

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

if not config("CLOUDINARY_URL", default=""):
    DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"
