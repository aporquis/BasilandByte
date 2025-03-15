import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import timedelta
import dj_database_url

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file
if os.getenv("RENDER") == "true":
    print("Running in Render production environment")
else:
    # Load dotenv for local development only
    dotenv_path = BASE_DIR / ".env"
    if dotenv_path.exists():
        load_dotenv(dotenv_path)
    else:
        raise FileNotFoundError(f"Missing .env file at {dotenv_path}")

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "fallback-secret-key")

# SECURITY WARNING
DEBUG = os.getenv("DEBUG", "").lower() == "true"

# Allowed Hosts Configuration
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").replace(" ", "").split(",")

# CORS Configuration (Ensuring frontend can communicate with backend)
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")


# Application definition
INSTALLED_APPS = [
    "corsheaders",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "recipes",  # Our app
    "django_extensions",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",  # Required for JWT Blacklist
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # Ensure CORS is loaded first
    "django.middleware.security.SecurityMiddleware",
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Whitenoise added here
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

# Database Configuration (PostgreSQL)
DATABASES = {
    "default": dj_database_url.config(default=os.getenv("DATABASE_URL"))
}

CSRF_TRUSTED_ORIGINS = [
    "https://basilandbyte.onrender.com"
]

TEST = {
    'NAME': 'test_capstone_recipe',
    'CREATE_DB': True,
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Media files (Uploaded user images)
MEDIA_URL = "/recipe_images/"
MEDIA_ROOT = os.getenv("RECIPE_IMAGE_PATH", str(BASE_DIR / "recipe_images"))

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Django Rest Framework Authentication Settings
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        # Allows public access unless restricted in views
        "rest_framework.permissions.AllowAny",
    ),
}

# JWT Authentication Configuration
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

#Using secure cookies & HTTPS settings for production
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True

#HTTPS Redirect for Render
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"