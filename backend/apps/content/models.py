"""
Content Management Models.
Handles courses, modules, lessons, and learning objects.
"""

from django.db import models
from django.conf import settings


class Category(models.Model):
    """Course categories for organization."""

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # Icon name or URL
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "categories"
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Course(models.Model):
    """Main course model."""

    LEVEL_CHOICES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="courses_taught",
    )
    thumbnail = models.URLField(blank=True)
    duration = models.CharField(max_length=50)  # e.g., "10 hours"
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default="beginner")
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name="courses",
    )
    is_published = models.BooleanField(default=False)
    rating = models.FloatField(default=0.0)
    students_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "courses"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def total_lessons(self):
        return Lesson.objects.filter(module__course=self).count()

    @property
    def total_duration_minutes(self):
        """Calculate total duration in minutes."""
        lessons = Lesson.objects.filter(module__course=self)
        total = 0
        for lesson in lessons:
            try:
                # Parse duration like "10 min" or "1h 30min"
                duration = lesson.duration.lower()
                if "h" in duration:
                    parts = duration.replace("h", " ").replace("min", "").split()
                    total += int(parts[0]) * 60
                    if len(parts) > 1:
                        total += int(parts[1])
                elif "min" in duration:
                    total += int(duration.replace("min", "").strip())
            except (ValueError, IndexError):
                pass
        return total


class Module(models.Model):
    """Course module/section containing lessons."""

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="modules",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "modules"
        ordering = ["course", "order"]
        unique_together = ["course", "order"]

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    @property
    def total_lessons(self):
        return self.lessons.count()


class Lesson(models.Model):
    """Individual lesson within a module."""

    TYPE_CHOICES = [
        ("video", "Video"),
        ("text", "Text/Article"),
        ("quiz", "Quiz"),
        ("interactive", "Interactive"),
    ]

    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name="lessons",
    )
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="text")
    duration = models.CharField(max_length=50)  # e.g., "15 min"
    order = models.PositiveIntegerField(default=0)
    content = models.JSONField(default=dict)  # Flexible content storage
    is_free = models.BooleanField(default=False)  # Preview lessons
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "lessons"
        ordering = ["module", "order"]
        unique_together = ["module", "order"]

    def __str__(self):
        return f"{self.module.title} - {self.title}"


class LearningObject(models.Model):
    """
    Granular learning content linked to concepts.
    Used for adaptive learning and recommendations.
    """

    TYPE_CHOICES = [
        ("explanation", "Explanation"),
        ("example", "Example"),
        ("exercise", "Exercise"),
        ("assessment", "Assessment"),
    ]

    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="learning_objects",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    content = models.JSONField(default=dict)
    difficulty = models.FloatField(default=0.5)  # 0.0 (easy) to 1.0 (hard)
    estimated_time = models.PositiveIntegerField(default=5)  # minutes
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "learning_objects"
        ordering = ["lesson", "difficulty"]

    def __str__(self):
        return self.title
