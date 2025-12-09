from apps.content.models import Course, Lesson


class ContentExternalFacade:
    """Facade for external modules to access content data using only IDs."""

    def course_exists(self, course_id) -> bool:
        return Course.objects.filter(id=course_id).exists()

    def published_course_exists(self, course_id) -> bool:
        return Course.objects.filter(id=course_id, is_published=True).exists()

    def lesson_exists_in_course(self, lesson_id, course_id) -> bool:
        return Lesson.objects.filter(id=lesson_id, module__course_id=course_id).exists()

    def get_module_id_for_lesson(self, lesson_id):
        try:
            return Lesson.objects.values_list("module_id", flat=True).get(id=lesson_id)
        except Lesson.DoesNotExist:
            return None

    def count_published_lessons_in_course(self, course_id) -> int:
        return Lesson.objects.filter(
            module__course_id=course_id,
            module__is_published=True,
            is_published=True,
        ).count()

    def count_published_lessons_in_module(self, module_id) -> int:
        return Lesson.objects.filter(module_id=module_id, is_published=True).count()

    def get_published_lesson_ids_in_module(self, module_id) -> list:
        return list(
            Lesson.objects.filter(module_id=module_id, is_published=True).values_list(
                "id", flat=True
            )
        )
