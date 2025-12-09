from decimal import Decimal
from django.utils import timezone

from apps.learning_activities.models import Enrollment


class EnrollmentProgressService:
    def update_enrollment_progress(
        self, enrollment: Enrollment, total_lessons: int, completed_count: int
    ) -> None:
        if total_lessons == 0:
            return

        progress_percent = Decimal(completed_count) / Decimal(total_lessons) * 100
        progress_percent = min(progress_percent, Decimal("100.00"))

        if progress_percent >= 100:
            status = Enrollment.Status.COMPLETED
            completed_at = timezone.now()
        elif progress_percent > 0:
            status = Enrollment.Status.IN_PROGRESS
            completed_at = None
        else:
            status = Enrollment.Status.STARTED
            completed_at = None

        enrollment.progress_percent = progress_percent
        enrollment.status = status
        enrollment.completed_at = completed_at
        enrollment.last_accessed_at = timezone.now()
        enrollment.save(
            update_fields=[
                "progress_percent",
                "status",
                "completed_at",
                "last_accessed_at",
                "updated_at",
            ]
        )
