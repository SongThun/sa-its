"""
URL configuration for Content Management module.
"""

from django.urls import path
from .views import (
    CategoryListView,
    CourseListView,
    CourseDetailView,
    CourseCreateView,
    CourseUpdateView,
    CourseDeleteView,
    ModuleListView,
    ModuleCreateView,
    LessonListView,
    LessonDetailView,
    LessonCreateView,
)

urlpatterns = [
    # Categories
    path("categories/", CategoryListView.as_view(), name="category-list"),
    # Courses
    path("courses/", CourseListView.as_view(), name="course-list"),
    path("courses/create/", CourseCreateView.as_view(), name="course-create"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path("courses/<int:pk>/update/", CourseUpdateView.as_view(), name="course-update"),
    path("courses/<int:pk>/delete/", CourseDeleteView.as_view(), name="course-delete"),
    # Modules
    path(
        "courses/<int:course_id>/modules/",
        ModuleListView.as_view(),
        name="module-list",
    ),
    path("modules/create/", ModuleCreateView.as_view(), name="module-create"),
    # Lessons
    path(
        "modules/<int:module_id>/lessons/",
        LessonListView.as_view(),
        name="lesson-list",
    ),
    path("lessons/<int:pk>/", LessonDetailView.as_view(), name="lesson-detail"),
    path("lessons/create/", LessonCreateView.as_view(), name="lesson-create"),
]
