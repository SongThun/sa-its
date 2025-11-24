"""
Learning Activities Models.
Handles user enrollment in courses and progress tracking.
"""

from django.db import models
from django.conf import settings


class Enrollment(models.Model):
    """User enrollment in a course."""

    STATUS_CHOICES = [
        ("active", "Active"),
        ("completed", "Completed"),
        ("dropped", "Dropped"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    course = models.ForeignKey(
        "content.Course",
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "enrollments"
        unique_together = ["user", "course"]
        ordering = ["-enrolled_at"]

    def __str__(self):
        return f"{self.user.email} - {self.course.title}"


class LessonProgress(models.Model):
    """Track user progress on individual lessons."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="lesson_progress",
    )
    lesson = models.ForeignKey(
        "content.Lesson",
        on_delete=models.CASCADE,
        related_name="progress_records",
    )
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    time_spent = models.PositiveIntegerField(default=0)  # seconds

    class Meta:
        db_table = "lesson_progress"
        unique_together = ["user", "lesson"]
        ordering = ["-started_at"]

    def __str__(self):
        status = "completed" if self.is_completed else "in progress"
        return f"{self.user.email} - {self.lesson.title} ({status})"


class CourseProgress(models.Model):
    """Aggregate progress for a user in a course."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="course_progress",
    )
    course = models.ForeignKey(
        "content.Course",
        on_delete=models.CASCADE,
        related_name="progress_records",
    )
    progress_percentage = models.FloatField(default=0.0)
    completed_lessons = models.PositiveIntegerField(default=0)
    total_lessons = models.PositiveIntegerField(default=0)
    last_accessed_lesson = models.ForeignKey(
        "content.Lesson",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    last_accessed_at = models.DateTimeField(auto_now=True)
    total_time_spent = models.PositiveIntegerField(default=0)  # seconds

    class Meta:
        db_table = "course_progress"
        unique_together = ["user", "course"]
        ordering = ["-last_accessed_at"]

    def __str__(self):
        return (
            f"{self.user.email} - {self.course.title} ({self.progress_percentage:.0f}%)"
        )

    def update_progress(self):
        """Recalculate progress based on completed lessons."""
        from apps.content.models import Lesson

        total = Lesson.objects.filter(module__course=self.course).count()
        completed = LessonProgress.objects.filter(
            user=self.user,
            lesson__module__course=self.course,
            is_completed=True,
        ).count()

        self.total_lessons = total
        self.completed_lessons = completed
        self.progress_percentage = (completed / total * 100) if total > 0 else 0
        self.save()
