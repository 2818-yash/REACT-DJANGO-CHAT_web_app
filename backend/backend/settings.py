from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-0y&&c%o2d4%ii+iued5oa26i7k+j*^*2%3^)!3d!40h!$9t)f$'

# 🔒 PRODUCTION
DEBUG = False

ALLOWED_HOSTS = [
    "react-django-chat-web-app.onrender.com",
]

# =========================
# APPLICATIONS
# =========================
INSTALLED_APPS = [
    'daphne',
    'channels',
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'api',
]

# =========================
# MIDDLEWARE
# =========================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# =========================
# CORS (ONLY FRONTEND)
# =========================
CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOWED_ORIGINS = [
    "https://react-django-chat-web-app.vercel.app",
]

# =========================
# CSRF (CRITICAL)
# =========================
CSRF_TRUSTED_ORIGINS = [
    "https://react-django-chat-web-app.vercel.app",
    "https://react-django-chat-web-app.onrender.com",
]


# =========================
# URL & TEMPLATES
# =========================
ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# =========================
# ASGI / WSGI
# =========================
ASGI_APPLICATION = 'backend.asgi.application'
WSGI_APPLICATION = 'backend.wsgi.application'

# =========================
# DATABASE (RENDER SQLITE OK)
# =========================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# =========================
# PASSWORD VALIDATION
# =========================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# =========================
# INTERNATIONALIZATION
# =========================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# =========================
# CHANNELS
# =========================
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    }
}

# =========================
# STATIC & MEDIA
# =========================
STATIC_URL = '/static/'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# =========================
# SECURITY (RENDER HTTPS)
# =========================
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
