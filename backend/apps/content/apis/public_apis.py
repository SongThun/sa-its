"""
Public APIs for Content module.
Read-only access to published courses, modules, and lessons.
"""

from rest_framework import generics, permissions
from apps.content.serializers import (
    CategorySerializer,
    CourseListSerializer,
    CourseDetailSerializer,
    ModuleDetailSerializer,
    LessonDetailSerializer,
)
from apps.content.services import (
    CategoryService,
    CourseService,
    ModuleService,
    LessonService,
)


class CategoryListView(generics.ListAPIView):
    """
    List all categories.
    GET /api/content/categories/
    """

    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return CategoryService.get_categories()


class CourseListView(generics.ListAPIView):
    """
    List published courses with optional filtering.
    GET /api/content/courses/?category=Web&level=beginner&search=python
    """

    serializer_class = CourseListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        filters = {
            "category": self.request.query_params.get("category"),
            "level": self.request.query_params.get("level"),
            "search": self.request.query_params.get("search"),
        }
        return CourseService.get_public_courses(filters)


class CourseDetailView(generics.RetrieveAPIView):
    """
    Get published course details with modules and lessons.
    GET /api/content/courses/{id}/
    """

    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "pk"

    def get_queryset(self):
        return CourseService.get_public_course_detail(self.kwargs["pk"])


class ModuleDetailView(generics.RetrieveAPIView):
    """
    Get module details with lessons.
    GET /api/content/modules/{id}/
    """

    serializer_class = ModuleDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "pk"

    def get_queryset(self):
        return ModuleService.get_public_module_detail(self.kwargs["pk"])


class LessonDetailView(generics.RetrieveAPIView):
    """
    Get lesson details.
    GET /api/content/lessons/{id}/
    """

    serializer_class = LessonDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "pk"

    def get_queryset(self):
        return LessonService.get_public_lesson_detail(self.kwargs["pk"])
