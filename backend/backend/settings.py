# backend/backend/settings.py
# Django settings for the backend project.
# This file configures the Django application for both local development and hosted environments.
# Hardcodes CORS and ALLOWED_HOSTS for production and local development, while keeping sensitive settings
# (like DATABASE_URL and DJANGO_SECRET_KEY) configurable via environment variables (e.g., Render dashboard).

import os
from pathlib import Path
from datetime import timedelta
import dj_database_url  # For parsing DATABASE_URL environment variable

# Base directory of the project (parent of settings.py)
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: Keep the secret key used in production secret!
# Use a secure key in production; set via environment variable (e.g., Render dashboard)
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "fallback-secret-key")

# SECURITY WARNING
DEBUG = os.getenv("DEBUG", "").lower() == "true"

# Allowed Hosts Configuration
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").replace(" ", "").split(",")
# SECURITY WARNING: Debug should be False in production
# Set via environment variable (e.g., Render dashboard); defaults to True for local development
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# Allowed hosts for the Django server
# Hardcoded to include production (Render) and generic local development hosts
# Render sets RENDER_EXTERNAL_HOSTNAME, which is appended if present
ALLOWED_HOSTS = [
    "basilandbyte.onrender.com",  # Hosted backend domain
    "localhost",  # Local development for all team members
    "127.0.0.1",  # Local development for all team members
]
RENDER_EXTERNAL_HOSTNAME = os.getenv('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# CORS Configuration: Allows frontend to communicate with backend
# Hardcoded to include production and local development origins for all team members
CORS_ALLOW_ALL_ORIGINS = False  # Disable allow-all for security
CORS_ALLOWED_ORIGINS = [
    "https://basilandbyte.vercel.app",  # Frontend URL (production)
    "https://basilandbyte.onrender.com",  # Backend URL (production)
    # Web frontend (local development for all team members)
    "http://localhost:3000",
    # React Native dev server (local development for all team members)
    "http://localhost:19000",
]
CORS_ALLOW_CREDENTIALS = True  # Allow cookies and credentials in CORS requests
CORS_ALLOW_METHODS = ["GET", "POST", "PUT",
                      "DELETE", "OPTIONS"]  # Allowed HTTP methods
CORS_ALLOW_HEADERS = ["*"]  # Allow all headers

# CSRF Trusted Origins: Required for POST requests in production
CSRF_TRUSTED_ORIGINS = [
    "https://basilandbyte.onrender.com",
    "https://basilandbyte.vercel.app",
]

# Application definition: List of installed Django apps
INSTALLED_APPS = [
    "corsheaders",  # For CORS support
    "django.contrib.admin",  # Django admin interface
    "django.contrib.auth",  # Authentication system
    "django.contrib.contenttypes",  # Content types framework
    "django.contrib.sessions",  # Session management
    "django.contrib.messages",  # Messaging framework
    "django.contrib.staticfiles",  # Static file handling
    "recipes",  # Your custom app
    "django_extensions",  # Useful Django extensions
    "rest_framework",  # Django REST Framework for API
    "rest_framework_simplejwt.token_blacklist",  # JWT token blacklist support
]

# Middleware configuration: Order matters
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # Must be first for CORS
    "django.middleware.security.SecurityMiddleware",  # Security enhancements
    "whitenoise.middleware.WhiteNoiseMiddleware",  # Serve static files in production
    "django.contrib.sessions.middleware.SessionMiddleware",  # Session handling
    # "django.middleware.common.CommonMiddleware",  # Disabled to avoid DELETE request issues
    "django.middleware.csrf.CsrfViewMiddleware",  # CSRF protection
    "django.contrib.auth.middleware.AuthenticationMiddleware",  # Authentication
    "django.contrib.messages.middleware.MessageMiddleware",  # Messages
    "django.middleware.clickjacking.XFrameOptionsMiddleware",  # Clickjacking protection
]

# URL configuration
ROOT_URLCONF = "backend.urls"

# Template configuration
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],  # Add custom template directories if needed
        "APP_DIRS": True,  # Look for templates in app directories
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

# WSGI application for production
WSGI_APPLICATION = "backend.wsgi.application"

# Database configuration: Uses dj_database_url to parse DATABASE_URL
# In production, DATABASE_URL is set via Render environment variables
# Defaults to SQLite for local development
DATABASES = {
    "default": dj_database_url.config(default='sqlite:///db.sqlite3')
}

# Test database configuration
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
# Hardcode the media root for local development; in production, set via Render environment variable
MEDIA_ROOT = str(BASE_DIR / "recipe_images")

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

# Server-Side Timeout Configuration
SOCKET_TIMEOUT = 30  # Matches client timeout of 30000ms

# Secure cookies & HTTPS settings for production
# Changed to not DEBUG to allow cookies over HTTP in local development
CSRF_COOKIE_SECURE = not DEBUG  # Disable in debug mode (local development)
SESSION_COOKIE_SECURE = not DEBUG  # Disable in debug mode (local development)

# HTTPS Redirect for Render (production)
# Disabled in debug mode to prevent redirect to HTTPS in local development
SECURE_SSL_REDIRECT = not DEBUG
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Logging configuration to debug issues
# Logs Django and authentication messages to the console
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
        'django.contrib.auth': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
