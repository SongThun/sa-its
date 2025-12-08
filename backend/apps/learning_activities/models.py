from django.db import models
from django.conf import settings

from apps.core.models import (
    UUIDPrimaryKeyMixin,
    TimestampMixin,
    CompletableMixin,
    ProgressMixin,
)


class Enrollment(
    UUIDPrimaryKeyMixin,
    ProgressMixin,
    TimestampMixin,
    models.Model,
):
    class Status(models.TextChoices):
        STARTED = "started", "Started"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="enrollments",
    )
    course = models.ForeignKey(
        "content.Course",
        on_delete=models.SET_NULL,
        null=True,
        related_name="enrollments",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.STARTED,
    )
    is_active = models.BooleanField(default=True)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-enrolled_at"]
        unique_together = ["student", "course"]
        verbose_name = "Enrollment"
        verbose_name_plural = "Enrollments"

    def __str__(self):
        return f"{self.student.email} - {self.course.title}"


class ModuleProgress(
    UUIDPrimaryKeyMixin,
    CompletableMixin,
    ProgressMixin,
    TimestampMixin,
    models.Model,
):
    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.CASCADE,
        related_name="module_progress",
    )
    module = models.ForeignKey(
        "content.Module",
        on_delete=models.CASCADE,
        related_name="student_progress",
    )

    class Meta:
        ordering = ["-updated_at"]
        unique_together = ["enrollment", "module"]
        verbose_name = "Module Progress"
        verbose_name_plural = "Module Progress"

    def __str__(self):
        status = "completed" if self.is_completed else f"{self.progress_percent}%"
        return f"{self.enrollment.student.email} - {self.module.title} ({status})"


class LessonProgress(
    UUIDPrimaryKeyMixin,
    CompletableMixin,
    TimestampMixin,
    models.Model,
):
    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.CASCADE,
        related_name="lesson_progress",
    )
    lesson = models.ForeignKey(
        "content.Lesson",
        on_delete=models.CASCADE,
        related_name="student_progress",
    )
    last_accessed_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        unique_together = ["enrollment", "lesson"]
        verbose_name = "Lesson Progress"
        verbose_name_plural = "Lesson Progress"

    def __str__(self):
        status = "completed" if self.is_completed else "in progress"
        return f"{self.enrollment.student.email} - {self.lesson.title} ({status})"
