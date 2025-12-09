from apps.content.models import Course, Module, Lesson


class InstructorAuthorityService:
    def is_course_owner(self, user, course_id) -> bool:
        return Course.objects.filter(id=course_id, instructor=user).exists()

    def is_module_owner(self, user, module_id) -> bool:
        return Module.objects.filter(id=module_id, course__instructor=user).exists()

    def is_lesson_owner(self, user, lesson_id) -> bool:
        return Lesson.objects.filter(
            id=lesson_id, module__course__instructor=user
        ).exists()
