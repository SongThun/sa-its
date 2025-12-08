from django.db import models
from django.conf import settings

from apps.core.models import (
    UUIDPrimaryKeyMixin,
    TimestampMixin,
    TitleDescriptionMixin,
    PublishableMixin,
    OrderableMixin,
)


class Category(TimestampMixin, models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Topic(TimestampMixin, models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Course(
    UUIDPrimaryKeyMixin,
    TitleDescriptionMixin,
    PublishableMixin,
    TimestampMixin,
    models.Model,
):
    class DifficultyLevel(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"
        EXPERT = "expert", "Expert"

    difficulty_level = models.CharField(
        max_length=20,
        choices=DifficultyLevel.choices,
        default=DifficultyLevel.BEGINNER,
    )
    est_duration = models.PositiveIntegerField(default=0)
    cover_image = models.URLField(
        max_length=500,
        blank=True,
        default=settings.DEFAULT_COURSE_COVER_IMAGE,
    )
    students_count = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="courses",
    )
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="courses_taught",
    )
    prerequisites = models.ManyToManyField(
        "self", symmetrical=False, blank=True, related_name="required_by"
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Module(
    UUIDPrimaryKeyMixin,
    TitleDescriptionMixin,
    PublishableMixin,
    OrderableMixin,
    TimestampMixin,
    models.Model,
):
    is_published = models.BooleanField(default=True)
    estimated_duration = models.PositiveIntegerField(default=0)

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="modules")

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Lesson(
    UUIDPrimaryKeyMixin,
    PublishableMixin,
    OrderableMixin,
    TimestampMixin,
    models.Model,
):
    class ContentType(models.TextChoices):
        VIDEO = "video", "Video"
        TEXT = "text", "Text"
        DOCUMENT = "document", "Document"

    title = models.CharField(max_length=255)
    content_type = models.CharField(
        max_length=20,
        choices=ContentType.choices,
        default=ContentType.TEXT,
    )
    content_data = models.JSONField(default=dict, blank=True)
    content = models.TextField(blank=True)
    is_published = models.BooleanField(default=True)
    estimated_duration = models.PositiveIntegerField(default=0)

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="lessons")
    topics = models.ManyToManyField(Topic, blank=True, related_name="lessons")

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self):
        return f"{self.module.title} - {self.title}"

    def get_content(self):
        if self.content_data:
            return self.content_data
        if self.content:
            return {"main_content": self.content}
        return {}
