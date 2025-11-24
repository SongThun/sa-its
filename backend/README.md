# Backend - Django REST Framework

This is the backend API for the SA-ITS (Intelligent Tutoring System) project.

## Project Structure

```
backend/
├── config/              # Django project settings
│   ├── settings.py     # Main settings file
│   ├── urls.py         # Root URL configuration
│   └── wsgi.py         # WSGI application
├── apps/               # Django applications (modules)
│   └── (your apps here)
├── manage.py           # Django management script
├── requirements.txt    # Python dependencies
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose configuration
└── .env                # Environment variables
```

## Adding a New Django App/Module

### 1. Create a module (app in django context)

Navigate to the backend directory and create a new Django app inside the `apps` directory:

```bash
mkdir -p apps/module_name
python manage.py startapp module_name apps/module_name
```

### 2. Register the app

Add the app to `INSTALLED_APPS` in [config/settings.py](config/settings.py):

```python
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party apps
    "rest_framework",
    "drf_spectacular",
    # Internal apps
    "apps.module_name",  # add the new app here
]
```

### 3. Create Models (Optional)

Define your data models in `apps/module_name/models.py`:

```python
from django.db import models

class YourModel(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Your Model"
        verbose_name_plural = "Your Models"

    def __str__(self):
        return self.name
```

### 4. Create Serializers

Create `apps/module_name/serializers.py` for API serialization:

```python
from rest_framework import serializers
from .models import YourModel

class YourModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = YourModel
        fields = '__all__'
```

### 5. Create Views

Create API views in `apps/module_name/views.py`:

```python
from rest_framework import viewsets
from .models import YourModel
from .serializers import YourModelSerializer

class YourModelViewSet(viewsets.ModelViewSet):
    queryset = YourModel.objects.all()
    serializer_class = YourModelSerializer
```

### 6. Register URLs

Create `apps/module_name/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import YourModelViewSet

router = DefaultRouter()
router.register(r'your-models', YourModelViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

Then include it in the main [config/urls.py](config/urls.py):

```python
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    # API documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    # Your app URLs
    path("api/your-app/", include("apps.module_name.urls")),
]
```

### 7. Create and Run Migrations

After creating models, generate and apply migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

### 8. Register in Admin (Optional)

To manage your models via Django admin, register them in `apps/module_name/admin.py`:

```python
from django.contrib import admin
from .models import YourModel

@admin.register(YourModel)
class YourModelAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at', 'updated_at']
    search_fields = ['name']
    list_filter = ['created_at']
```

### 9. Test Your API

Start the development server:

```bash
python manage.py runserver
```

Access your API at:
- API endpoint: http://localhost:8000/api/your-app/your-models/
- Interactive docs: http://localhost:8000/api/docs/

## Best Practices

### App Structure

Organize your app with the following structure:

```
apps/module_name/
├── __init__.py
├── admin.py           # Admin configuration
├── apps.py            # App configuration
├── models.py          # Database models
├── serializers.py     # DRF serializers
├── views.py           # API views/viewsets
├── urls.py            # URL routing
├── tests.py           # Unit tests
├── permissions.py     # Custom permissions (optional)
├── filters.py         # Custom filters (optional)
└── migrations/        # Database migrations
```

### Naming Conventions

- **Apps**: Use lowercase with underscores (e.g., `user_management`, `course_catalog`)
- **Models**: Use PascalCase (e.g., `UserProfile`, `CourseModule`)
- **Views**: Use PascalCase with descriptive suffixes (e.g., `CourseViewSet`, `UserListView`)
- **URLs**: Use lowercase with hyphens (e.g., `/api/user-management/`, `/api/courses/`)

### API Versioning

For production apps, consider versioning your API:

```python
# config/urls.py
urlpatterns = [
    path("api/v1/your-app/", include("apps.module_name.urls")),
]
```

### Testing

Write tests in `apps/module_name/tests.py`:

```python
from rest_framework.test import APITestCase
from rest_framework import status

class YourModelTests(APITestCase):
    def test_create_model(self):
        url = '/api/your-app/your-models/'
        data = {'name': 'Test'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
```


## Database Seeding

The project includes a database seeding system for populating the database with example/test data.

### Directory Structure

```
backend/data/
├── __init__.py
├── seed.py              # Main seeding script
└── fixtures/            # JSON fixture files
    └── users.json       # Example user data
```

### JSON Fixture Format

Fixture files follow this format:

```json
{
  "table": "users",
  "data": [
    {
      "username": "admin",
      "email": "admin@example.com",
      "password": "Admin123!",
      "fullname": "System Administrator",
      "is_staff": true,
      "is_superuser": true
    },
    {
      "username": "student1",
      "email": "student1@example.com",
      "password": "Student123!",
      "fullname": "Alice Johnson"
    }
  ]
}
```

### Usage

**Via Django management command (recommended):**

```bash
# Seed all fixtures
python manage.py seed

# Seed a specific fixture file
python manage.py seed --file users.json

# Clear a table before seeding
python manage.py seed --clear users

# Specify custom fixtures directory
python manage.py seed --dir /path/to/fixtures
```

**Via script directly:**

```bash
# Seed all fixtures
python data/seed.py

# Seed specific file
python data/seed.py --file data/fixtures/users.json

# Clear table before seeding
python data/seed.py --clear users
```

**Via Docker:**

```bash
docker-compose run --rm django python manage.py seed
```

### Adding New Fixtures

1. Create a new JSON file in `data/fixtures/` (e.g., `courses.json`)
2. Follow the format with `table` and `data` fields
3. The `table` field should match the database table name (check model's `Meta.db_table`)

### Custom Table Handlers

For tables requiring special handling (like password hashing for users), add a handler in `data/seed.py`:

```python
@register_handler("your_table_name")
def handle_your_table(data_list):
    # Custom logic here
    created_count = 0
    skipped_count = 0
    # ... process data_list ...
    return created_count, skipped_count
```

### Features

- **Automatic password hashing** for user records
- **Skip existing records** (by email for users, by primary key for others)
- **Transaction-safe** - all-or-nothing seeding
- **Extensible** - add custom handlers for special tables
- **Generic handler** - works automatically for any Django model

---

## Common Django Management Commands

```bash
# Create a new app
python manage.py startapp app_name

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver

# Run tests
python manage.py test

# Open Django shell
python manage.py shell

# Collect static files
python manage.py collectstatic

# Seed the database with example data
python manage.py seed
```

## API Documentation

The backend uses `drf-spectacular` for automatic OpenAPI documentation. After adding your app and views, the documentation will automatically update at:

- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/
- OpenAPI Schema: http://localhost:8000/api/schema/

## Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
