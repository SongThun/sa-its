from typing import Optional

from apps.content.models import Lesson, Module
from django.db.models import Count, Prefetch, QuerySet


class ModuleService:
    @staticmethod
    def get_public_modules(course_id: Optional[int] = None) -> QuerySet:
        queryset = (
            Module.objects.filter(course__is_published=True)
            .select_related("course")
            .annotate(total_lessons=Count("lessons"))
            .order_by("order")
        )

        if course_id:
            queryset = queryset.filter(course_id=course_id)

        return queryset

    @staticmethod
    def get_public_module_detail(module_id: int) -> QuerySet:
        return (
            Module.objects.filter(id=module_id, course__is_published=True)
            .prefetch_related(
                Prefetch("lessons", queryset=Lesson.objects.order_by("order"))
            )
            .select_related("course")
        )

    @staticmethod
    def get_instructor_modules(instructor, course_id: Optional[int] = None) -> QuerySet:
        queryset = (
            Module.objects.filter(course__instructor=instructor)
            .select_related("course")
            .annotate(total_lessons=Count("lessons"))
            .order_by("course", "order")
        )

        if course_id:
            queryset = queryset.filter(course_id=course_id)

        return queryset

    @staticmethod
    def get_instructor_module_detail(module_id: int, instructor) -> QuerySet:
        return (
            Module.objects.filter(id=module_id, course__instructor=instructor)
            .prefetch_related(
                Prefetch("lessons", queryset=Lesson.objects.order_by("order"))
            )
            .select_related("course")
        )
