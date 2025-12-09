from django.db import models
from django.conf import settings
import uuid

from apps.common.models import TimestampMixin


# ==================== MIXINS ====================


class PublishableMixin(models.Model):
    is_published = models.BooleanField(default=False)

    class Meta:
        abstract = True

    def publish(self) -> None:
        if not self.is_published:
            self.is_published = True
            self.save(update_fields=["is_published", "updated_at"])

    def unpublish(self) -> None:
        if self.is_published:
            self.is_published = False
            self.save(update_fields=["is_published", "updated_at"])


# ==================== MODELS ====================


class Category(TimestampMixin):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Topic(TimestampMixin):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Course(TimestampMixin, PublishableMixin):
    class DifficultyLevel(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"
        EXPERT = "expert", "Expert"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
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

    def get_instructor(self):
        return self.instructor


class Module(TimestampMixin, PublishableMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    estimated_duration = models.PositiveIntegerField(default=0)

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="modules")

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    def get_instructor(self):
        return self.course.instructor


class Lesson(TimestampMixin, PublishableMixin):
    class ContentType(models.TextChoices):
        VIDEO = "video", "Video"
        TEXT = "text", "Text"
        DOCUMENT = "document", "Document"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    content_type = models.CharField(
        max_length=20,
        choices=ContentType.choices,
        default=ContentType.TEXT,
    )
    content_data = models.JSONField(default=dict, blank=True)
    content = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    estimated_duration = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="lessons")
    topics = models.ManyToManyField(Topic, blank=True, related_name="lessons")

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self):
        return f"{self.module.title} - {self.title}"

    def get_instructor(self):
        return self.module.course.instructor
