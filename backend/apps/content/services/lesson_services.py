from typing import Optional

from apps.content.models import Lesson
from django.db.models import QuerySet


class LessonService:
    @staticmethod
    def get_public_lessons(
        module_id: Optional[int] = None, course_id: Optional[int] = None
    ) -> QuerySet:
        queryset = (
            Lesson.objects.filter(module__course__is_published=True)
            .select_related("module", "module__course")
            .order_by("module__order", "order")
        )

        if module_id:
            queryset = queryset.filter(module_id=module_id)

        if course_id:
            queryset = queryset.filter(module__course_id=course_id)

        return queryset

    @staticmethod
    def get_public_lesson_detail(lesson_id: int) -> QuerySet:
        return Lesson.objects.filter(
            id=lesson_id, module__course__is_published=True
        ).select_related("module", "module__course")

    @staticmethod
    def get_instructor_lessons(
        instructor, module_id: Optional[int] = None, course_id: Optional[int] = None
    ) -> QuerySet:
        queryset = (
            Lesson.objects.filter(module__course__instructor=instructor)
            .select_related("module", "module__course")
            .order_by("module__order", "order")
        )

        if module_id:
            queryset = queryset.filter(module_id=module_id)

        if course_id:
            queryset = queryset.filter(module__course_id=course_id)

        return queryset

    @staticmethod
    def get_instructor_lesson_detail(lesson_id: int, instructor) -> QuerySet:
        return Lesson.objects.filter(
            id=lesson_id, module__course__instructor=instructor
        ).select_related("module", "module__course")
