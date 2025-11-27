"""Content serializers package."""

from apps.content.serializers.course_serializers import (
    CategorySerializer,
    CourseListSerializer,
    CourseDetailSerializer,
    InstructorCourseListSerializer,
    InstructorCourseDetailSerializer,
    InstructorCourseWriteSerializer,
)
from apps.content.serializers.module_serializers import (
    ModuleListSerializer,
    ModuleDetailSerializer,
    InstructorModuleSerializer,
)
from apps.content.serializers.lesson_serializers import (
    LessonListSerializer,
    InstructorLessonSerializer,
)

# Aliases for backwards compatibility
LessonDetailSerializer = LessonListSerializer

__all__ = [
    "CategorySerializer",
    "CourseListSerializer",
    "CourseDetailSerializer",
    "InstructorCourseListSerializer",
    "InstructorCourseDetailSerializer",
    "InstructorCourseWriteSerializer",
    "ModuleListSerializer",
    "ModuleDetailSerializer",
    "InstructorModuleSerializer",
    "LessonListSerializer",
    "LessonDetailSerializer",
    "InstructorLessonSerializer",
]
