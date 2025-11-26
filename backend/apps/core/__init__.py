"""
Core App.
Provides base models and services for use across the application.

Import models lazily to avoid circular import issues during Django startup.
"""

# Don't import models here - causes AppRegistryNotReady
# Instead, import directly where needed:
# from apps.core.models import BaseModel
