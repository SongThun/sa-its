"""
Views for Content Management module.
"""

from rest_framework import generics, permissions
from django.db.models import Count

from .models import Category, Course, Module, Lesson
from .serializers import (
    CategorySerializer,
    CourseListSerializer,
    CourseDetailSerializer,
    CourseCreateSerializer,
    ModuleSerializer,
    ModuleCreateSerializer,
    LessonSerializer,
    LessonCreateSerializer,
)


class IsInstructorOrReadOnly(permissions.BasePermission):
    """
    Custom permission: instructors can edit their own courses.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        # Check if user is the instructor
        if hasattr(obj, "instructor"):
            return obj.instructor == request.user
        if hasattr(obj, "course"):
            return obj.course.instructor == request.user
        if hasattr(obj, "module"):
            return obj.module.course.instructor == request.user

        return False


# Category Views
class CategoryListView(generics.ListAPIView):
    """
    List all categories.
    GET /api/content/categories/
    """

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


# Course Views
class CourseListView(generics.ListAPIView):
    """
    List published courses with optional filtering.
    GET /api/content/courses/
    """

    serializer_class = CourseListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Course.objects.filter(is_published=True).annotate(
            total_lessons=Count("modules__lessons")
        )

        # Filter by category
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category__name__iexact=category)

        # Filter by level
        level = self.request.query_params.get("level")
        if level:
            queryset = queryset.filter(level=level.lower())

        # Search
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(title__icontains=search)

        return queryset


class CourseDetailView(generics.RetrieveAPIView):
    """
    Get course details with modules and lessons.
    GET /api/content/courses/{id}/
    """

    queryset = Course.objects.annotate(total_lessons=Count("modules__lessons"))
    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.AllowAny]


class CourseCreateView(generics.CreateAPIView):
    """
    Create a new course (instructors only).
    POST /api/content/courses/
    """

    serializer_class = CourseCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


class CourseUpdateView(generics.UpdateAPIView):
    """
    Update a course (instructor only).
    PUT/PATCH /api/content/courses/{id}/
    """

    queryset = Course.objects.all()
    serializer_class = CourseCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]


class CourseDeleteView(generics.DestroyAPIView):
    """
    Delete a course (instructor only).
    DELETE /api/content/courses/{id}/
    """

    queryset = Course.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]


# Module Views
class ModuleListView(generics.ListAPIView):
    """
    List modules for a course.
    GET /api/content/courses/{course_id}/modules/
    """

    serializer_class = ModuleSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        course_id = self.kwargs["course_id"]
        return Module.objects.filter(course_id=course_id)


class ModuleCreateView(generics.CreateAPIView):
    """
    Create a new module.
    POST /api/content/modules/
    """

    serializer_class = ModuleCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


# Lesson Views
class LessonListView(generics.ListAPIView):
    """
    List lessons for a module.
    GET /api/content/modules/{module_id}/lessons/
    """

    serializer_class = LessonSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        module_id = self.kwargs["module_id"]
        return Lesson.objects.filter(module_id=module_id)


class LessonDetailView(generics.RetrieveAPIView):
    """
    Get lesson details.
    GET /api/content/lessons/{id}/
    """

    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]


class LessonCreateView(generics.CreateAPIView):
    """
    Create a new lesson.
    POST /api/content/lessons/
    """

    serializer_class = LessonCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
