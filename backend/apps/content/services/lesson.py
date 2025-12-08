from typing import List

from apps.content.models import Lesson, Module, Topic
from apps.content.services.mixins import (
    QueryMixin,
    PublishableMixin,
    InstructorMixin,
    ChildContentMixin,
)


class LessonService(
    QueryMixin[Lesson],
    PublishableMixin[Lesson],
    InstructorMixin[Lesson],
    ChildContentMixin[Lesson, Module],
):
    model = Lesson
    instructor_path = "module__course__instructor"
    parent_field = "module"

    def exists_in_course(self, lesson_id, course_id) -> bool:
        return self.exists_under_ancestor(lesson_id, "course", course_id)

    def count_published_in_course(self, course_id) -> int:
        return Lesson.objects.filter(
            module__course_id=course_id,
            is_published=True,
            module__is_published=True,
        ).count()

    def count_published_in_module(self, module_id) -> int:
        return Lesson.objects.filter(module_id=module_id, is_published=True).count()

    def get_published_ids_in_module(self, module_id) -> List:
        return list(
            Lesson.objects.filter(module_id=module_id, is_published=True).values_list(
                "id", flat=True
            )
        )

    def set_topics(self, lesson: Lesson, topic_ids: list) -> None:
        if topic_ids is not None:
            lesson.topics.set(Topic.objects.filter(id__in=topic_ids))
