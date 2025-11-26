"""
Core Models.
Shared infrastructure models used across multiple modules.
"""

from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class Topic(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    slug = models.SlugField(unique=True, max_length=120)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_topics",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "topics"
        ordering = ["-created_at", "name"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return self.name


class ModuleItem(models.Model):
    module_id = models.PositiveIntegerField(db_index=True)
    order = models.PositiveIntegerField(default=0)

    # Generic Foreign Key to any model (Lesson, Quiz, Assignment, etc.)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "module_items"
        ordering = ["module_id", "order"]
        unique_together = ["module_id", "order"]
        indexes = [
            models.Index(fields=["module_id", "order"]),
            models.Index(fields=["content_type", "object_id"]),
        ]

    def __str__(self):
        return f"Module {self.module_id} - Item {self.order}"

    @property
    def item_type(self):
        if self.content_type:
            return self.content_type.model
        return None
