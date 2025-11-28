from django.utils import timezone

from apps.learning_activities.models import Enrollment


class EnrollmentService:
    @staticmethod
    def enroll_by_course_id(user, course_id) -> Enrollment:
        """
        Enroll a user in a course by course_id.
        If enrollment exists but is inactive, reactivate it.
        Caller must validate course exists before calling.
        """
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

    @staticmethod
    def unenroll_by_course_id(user, course_id) -> bool:
        """
        Unenroll a user from a course by course_id.
        Returns True if successful, False if not enrolled.
        Caller must validate course exists before calling.
        """
        updated = Enrollment.objects.filter(
            student_id=user.id, course_id=course_id, is_active=True
        ).update(is_active=False, updated_at=timezone.now())

        return updated > 0

    @staticmethod
    def is_enrolled(user, course) -> bool:
        """Check if user is actively enrolled in course."""
        return Enrollment.objects.filter(
            student_id=user.id, course_id=course.id, is_active=True
        ).exists()

    @staticmethod
    def is_enrolled_by_course_id(user, course_id) -> bool:
        """Check if user is actively enrolled in course by course_id."""
        return Enrollment.objects.filter(
            student_id=user.id, course_id=course_id, is_active=True
        ).exists()

    @staticmethod
    def get_enrollment_by_course_id(user, course_id) -> Enrollment | None:
        """Get active enrollment for user and course by course_id."""
        return Enrollment.objects.filter(
            student_id=user.id, course_id=course_id, is_active=True
        ).first()

    @staticmethod
    def get_user_enrollments(user):
        """Get all active enrollments for a user."""
        return Enrollment.objects.filter(
            student_id=user.id, is_active=True
        ).select_related("course")

    @staticmethod
    def update_last_accessed(enrollment: Enrollment) -> None:
        """Update the last accessed timestamp."""
        enrollment.last_accessed_at = timezone.now()
        enrollment.save(update_fields=["last_accessed_at", "updated_at"])
