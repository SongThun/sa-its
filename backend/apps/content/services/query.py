from django.db import models
from django.db.models import Count, Prefetch, QuerySet

from apps.content.models import Course, Module, Lesson, Category, Topic


class ContentQueryService:
    def get_all_categories(self) -> QuerySet[Category]:
        return Category.objects.all()

    def get_all_topics(self) -> QuerySet[Topic]:
        return Topic.objects.all()

    def get_instructor_courses_with_details(self, user) -> QuerySet[Course]:
        return (
            Course.objects.filter(instructor=user)
            .select_related("category", "instructor")
            .prefetch_related(
                Prefetch(
                    "modules",
                    queryset=Module.objects.order_by("order")
                    .annotate(total_lessons=Count("lessons"))
                    .prefetch_related(
                        Prefetch(
                            "lessons",
                            queryset=Lesson.objects.order_by("order").prefetch_related(
                                "topics"
                            ),
                        )
                    ),
                )
            )
            .annotate(total_lessons=Count("modules__lessons"))
        )

    def get_instructor_modules_with_lessons(self, user) -> QuerySet[Module]:
        return (
            Module.objects.filter(course__instructor=user)
            .select_related("course")
            .annotate(total_lessons=Count("lessons"))
            .prefetch_related(
                Prefetch(
                    "lessons",
                    queryset=Lesson.objects.order_by("order").prefetch_related(
                        "topics"
                    ),
                )
            )
            .order_by("order")
        )

    def get_instructor_lessons_with_topics(self, user) -> QuerySet[Lesson]:
        return (
            Lesson.objects.filter(module__course__instructor=user)
            .select_related("module__course")
            .prefetch_related("topics")
            .order_by("order")
        )

    def get_published_courses_with_content(self) -> QuerySet[Course]:
        return (
            Course.objects.filter(is_published=True)
            .select_related("category", "instructor")
            .prefetch_related(
                Prefetch(
                    "modules",
                    queryset=Module.objects.filter(is_published=True)
                    .order_by("order")
                    .annotate(
                        total_lessons=Count(
                            "lessons", filter=models.Q(lessons__is_published=True)
                        )
                    )
                    .prefetch_related(
                        Prefetch(
                            "lessons",
                            queryset=Lesson.objects.filter(is_published=True)
                            .order_by("order")
                            .prefetch_related("topics"),
                        )
                    ),
                )
            )
            .annotate(
                total_lessons=Count(
                    "modules__lessons",
                    filter=models.Q(
                        modules__is_published=True,
                        modules__lessons__is_published=True,
                    ),
                )
            )
        )
