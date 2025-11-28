from django.db.models import QuerySet

from apps.content.models import Course


class CourseService:
    @staticmethod
    def get_published_courses() -> QuerySet:
        return Course.objects.filter(is_published=True)

    @staticmethod
    def get_courses_for_instructor(instructor) -> QuerySet:
        return Course.objects.filter(instructor=instructor)

    @staticmethod
    def check_enrollment(user, course) -> bool:
        """Check if user is enrolled in the course."""
        # TODO: Implement when Enrollment model is added
        return False

    @staticmethod
    def publish(course: Course) -> None:
        if not course.is_published:
            course.is_published = True
            course.save(update_fields=["is_published", "updated_at"])

    @staticmethod
    def unpublish(course: Course) -> None:
        if course.is_published:
            course.is_published = False
            course.save(update_fields=["is_published", "updated_at"])
