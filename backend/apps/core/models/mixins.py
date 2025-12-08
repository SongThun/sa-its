import uuid
from django.db import models


class UUIDPrimaryKeyMixin(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class TimestampMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class TitleDescriptionMixin(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    class Meta:
        abstract = True


class PublishableMixin(models.Model):
    is_published = models.BooleanField(default=False)

    class Meta:
        abstract = True


class OrderableMixin(models.Model):
    order = models.PositiveIntegerField(default=0)

    class Meta:
        abstract = True


class CompletableMixin(models.Model):
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True


class ProgressMixin(models.Model):
    progress_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    class Meta:
        abstract = True
