"""
URL configuration for Content Management module.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Public APIs
from apps.content.apis.public_apis import (
    CategoryListView,
    CourseListView,
    CourseDetailView,
    ModuleDetailView,
    LessonDetailView,
)

# Instructor APIs
from apps.content.apis.instructor_apis import (
    InstructorCourseViewSet,
    InstructorModuleViewSet,
    InstructorLessonViewSet,
)

# Router for instructor viewsets
instructor_router = DefaultRouter()
instructor_router.register(
    "courses", InstructorCourseViewSet, basename="instructor-course"
)
instructor_router.register(
    "modules", InstructorModuleViewSet, basename="instructor-module"
)
instructor_router.register(
    "lessons", InstructorLessonViewSet, basename="instructor-lesson"
)

urlpatterns = [
    # ========================================================================
    # PUBLIC APIs - Read-only access to published content
    # ========================================================================
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("courses/", CourseListView.as_view(), name="course-list"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path("modules/<int:pk>/", ModuleDetailView.as_view(), name="module-detail"),
    path("lessons/<int:pk>/", LessonDetailView.as_view(), name="lesson-detail"),
    # ========================================================================
    # INSTRUCTOR APIs - Full CRUD for instructors' own content
    # ========================================================================
    path("instructor/", include(instructor_router.urls)),
]
