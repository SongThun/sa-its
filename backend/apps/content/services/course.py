from typing import Dict, Any, Optional

from apps.content.models import Course, Category
from apps.content.services.mixins import QueryMixin, PublishableMixin, InstructorMixin


class CourseService(
    QueryMixin[Course],
    PublishableMixin[Course],
    InstructorMixin[Course],
):
    model = Course
    instructor_path = "instructor"

    def resolve_foreign_keys(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        resolved = data.copy()
        category_id = resolved.pop("category_id", None)

        if category_id is not None:
            try:
                resolved["category"] = Category.objects.get(id=category_id)
            except Category.DoesNotExist:
                return None

        return resolved

    def get_statistics(self, course: Course) -> dict:
        modules = course.modules.all()
        total_lessons = 0
        total_duration = 0
        published_lessons = 0

        for module in modules:
            lessons = module.lessons.all()
            total_lessons += lessons.count()
            published_lessons += lessons.filter(is_published=True).count()
            total_duration += sum(lesson.estimated_duration for lesson in lessons)

        return {
            "total_modules": modules.count(),
            "published_modules": modules.filter(is_published=True).count(),
            "total_lessons": total_lessons,
            "published_lessons": published_lessons,
            "total_duration_minutes": total_duration,
        }
