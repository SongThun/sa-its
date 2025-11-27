from typing import Dict, Optional

from apps.content.models import Course, Lesson, Module
from django.db.models import Count, Prefetch, Q, QuerySet


class CourseService:
    @staticmethod
    def get_public_courses(filters: Optional[Dict] = None) -> QuerySet:
        queryset = (
            Course.objects.filter(is_published=True)
            .annotate(total_lessons=Count("modules__lessons"))
            .select_related("category", "instructor")
        )

        if not filters:
            return queryset

        if category := filters.get("category"):
            queryset = queryset.filter(category__name__iexact=category)

        if level := filters.get("level"):
            queryset = queryset.filter(level=level.lower())

        if search := filters.get("search"):
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        return queryset

    @staticmethod
    def get_public_course_detail(course_id: int) -> QuerySet:
        return (
            Course.objects.filter(id=course_id, is_published=True)
            .prefetch_related(
                Prefetch(
                    "modules",
                    queryset=Module.objects.order_by("order").prefetch_related(
                        Prefetch("lessons", queryset=Lesson.objects.order_by("order"))
                    ),
                )
            )
            .select_related("category", "instructor")
        )

    @staticmethod
    def get_instructor_courses(instructor, filters: Optional[Dict] = None) -> QuerySet:
        queryset = (
            Course.objects.filter(instructor=instructor)
            .annotate(total_lessons=Count("modules__lessons"))
            .select_related("category")
        )

        if filters:
            if level := filters.get("level"):
                queryset = queryset.filter(level=level.lower())
            if search := filters.get("search"):
                queryset = queryset.filter(
                    Q(title__icontains=search) | Q(description__icontains=search)
                )
            if is_published := filters.get("is_published"):
                queryset = queryset.filter(is_published=is_published)

        return queryset

    @staticmethod
    def get_instructor_course_detail(course_id: int, instructor) -> QuerySet:
        return (
            Course.objects.filter(id=course_id, instructor=instructor)
            .prefetch_related(
                Prefetch(
                    "modules",
                    queryset=Module.objects.order_by("order").prefetch_related(
                        Prefetch("lessons", queryset=Lesson.objects.order_by("order"))
                    ),
                )
            )
            .select_related("category")
        )
