from dataclasses import dataclass
from django.utils import timezone

from apps.learning_activities.models import Enrollment


@dataclass
class EnrollmentResult:
    success: bool
    enrollment: Enrollment | None = None
    error: str | None = None


class EnrollmentFacade:
    """Facade for all enrollment operations (queries and mutations)."""

    def __init__(self, content_facade=None):
        self._content_facade = content_facade

    @property
    def content_facade(self):
        if self._content_facade is None:
            from apps.content.services import content_facade

            self._content_facade = content_facade
        return self._content_facade

    # ==================== Queries ====================

    def is_enrolled(self, user, course_id) -> bool:
        return Enrollment.objects.filter(
            student_id=user.id, course_id=course_id, is_active=True
        ).exists()

    def get_enrollment_by_course_id(self, user, course_id) -> Enrollment | None:
        return Enrollment.objects.filter(
            student_id=user.id, course_id=course_id, is_active=True
        ).first()

    def get_user_enrollments(self, user, status_filter: str = None):
        queryset = Enrollment.objects.filter(
            student_id=user.id, is_active=True
        ).select_related("course")

        if status_filter == "ongoing":
            queryset = queryset.exclude(status="completed").order_by(
                "-last_accessed_at"
            )
        elif status_filter == "completed":
            queryset = queryset.filter(status="completed")

        return queryset

    # ==================== Mutations ====================

    def enroll(self, user, course_id) -> EnrollmentResult:
        """Enroll user in a course with validation."""
        if not self.content_facade.published_course_exists(course_id):
            return EnrollmentResult(success=False, error="Course not found")

        enrollment = self._create_or_reactivate_enrollment(user, course_id)
        return EnrollmentResult(success=True, enrollment=enrollment)

    def unenroll(self, user, course_id) -> EnrollmentResult:
        """Unenroll user from a course with validation."""
        if not self.content_facade.course_exists(course_id):
            return EnrollmentResult(success=False, error="Course not found")

        updated = Enrollment.objects.filter(
            student_id=user.id, course_id=course_id, is_active=True
        ).update(is_active=False, updated_at=timezone.now())

        if not updated:
            return EnrollmentResult(success=False, error="Not enrolled in this course")

        return EnrollmentResult(success=True)

    def update_last_accessed(self, enrollment: Enrollment) -> None:
        enrollment.last_accessed_at = timezone.now()
        enrollment.save(update_fields=["last_accessed_at", "updated_at"])

    # ==================== Internal ====================

    def _create_or_reactivate_enrollment(self, user, course_id) -> Enrollment:
        enrollment, created = Enrollment.objects.get_or_create(
            student_id=user.id,
            course_id=course_id,
            defaults={"is_active": True, "status": Enrollment.Status.STARTED},
        )

        if not created and not enrollment.is_active:
            enrollment.is_active = True
            enrollment.status = Enrollment.Status.STARTED
            enrollment.save(update_fields=["is_active", "status", "updated_at"])

        return enrollment
