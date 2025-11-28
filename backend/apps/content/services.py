from django.db.models import QuerySet
from typing import Dict, Any

from apps.content.models import Course, Module, Category, Lesson, Topic


class ContentFacade:
    @staticmethod
    def get_all_category() -> QuerySet:
        """Get all categories."""
        return Category.objects.all()

    @staticmethod
    def get_all_categories() -> QuerySet:
        """Get all categories (alias)."""
        return Category.objects.all()

    @staticmethod
    def get_published_courses() -> QuerySet:
        return Course.objects.filter(is_published=True)

    @staticmethod
    def get_courses_for_instructor(instructor) -> QuerySet:
        return Course.objects.filter(instructor=instructor)

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

    @staticmethod
    def resolve_course_fks(course_data: Dict[str, Any]) -> Dict[str, Any] | None:
        """Resolve category_id to Category object for course creation/update.

        Returns:
            Dict with resolved FKs, or None if category_id is invalid
        """
        resolved_data = course_data.copy()
        category_id = resolved_data.pop("category_id", None)

        if category_id is not None:
            try:
                resolved_data["category"] = Category.objects.get(id=category_id)
            except Category.DoesNotExist:
                return None

        return resolved_data

    @staticmethod
    def get_modules_for_instructor(instructor) -> QuerySet:
        return Module.objects.filter(course__instructor=instructor)

    @staticmethod
    def add_module_to_course(instructor, course_id, module_data) -> Module | None:
        """Validate course ownership and create module.

        Returns:
            Created Module or None if course not found/no permission
        """
        try:
            course = Course.objects.get(instructor=instructor, id=course_id)
        except Course.DoesNotExist:
            return None
        module = Module.objects.create(**module_data, course=course)
        return module

    @staticmethod
    def resolve_module_update(
        instructor, module_id, module_data: Dict[str, Any]
    ) -> tuple[Module, Dict[str, Any]] | tuple[None, None]:
        """Validate module ownership and return module instance with data.

        Returns:
            Tuple of (Module instance, module_data) or (None, None) if not found/no permission
        """
        try:
            module = Module.objects.get(course__instructor=instructor, id=module_id)
        except Module.DoesNotExist:
            return None, None
        return module, module_data

    @staticmethod
    def get_lessons_for_instructor(instructor) -> QuerySet:
        return Lesson.objects.filter(module__course__instructor=instructor)

    @staticmethod
    def add_lesson_to_module(instructor, module_id, lesson_data) -> Lesson | None:
        """Validate module ownership and create lesson.

        Returns:
            Created Lesson or None if module not found/no permission
        """
        try:
            module = Module.objects.get(course__instructor=instructor, id=module_id)
        except Module.DoesNotExist:
            return None

        # Extract and resolve topic_ids
        topic_ids = lesson_data.pop("topic_ids", [])
        lesson = Lesson.objects.create(**lesson_data, module=module)

        if topic_ids:
            lesson.topics.set(Topic.objects.filter(id__in=topic_ids))

        return lesson

    @staticmethod
    def resolve_lesson_update(
        instructor, lesson_id, lesson_data: Dict[str, Any]
    ) -> tuple[Lesson, Dict[str, Any]] | tuple[None, None]:
        """Validate lesson ownership and resolve topic_ids.

        Returns:
            Tuple of (Lesson instance, resolved_data) or (None, None) if not found/no permission
        """
        try:
            lesson = Lesson.objects.get(
                module__course__instructor=instructor, id=lesson_id
            )
        except Lesson.DoesNotExist:
            return None, None

        # Extract topic_ids for later assignment
        resolved_data = lesson_data.copy()
        topic_ids = resolved_data.pop("topic_ids", None)

        return lesson, resolved_data, topic_ids

    @staticmethod
    def check_enrollment(user, course: Course) -> bool:
        """Check if user is enrolled in course."""
        # TODO: Implement enrollment check when Enrollment model is ready
        return False
