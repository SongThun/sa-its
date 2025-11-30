from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.content.apis import (
    CoursePublicViewSet,
    CourseInstructorViewSet,
    ModuleViewSet,
    CourseModulesView,
    LessonViewSet,
    ModuleLessonsView,
    CategoryViewSet,
    TopicViewSet,
)

router = DefaultRouter()
router.register(r"courses", CoursePublicViewSet, basename="course")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"topics", TopicViewSet, basename="topic")
router.register(
    r"instructor/courses", CourseInstructorViewSet, basename="instructor-course"
)
router.register(r"instructor/modules", ModuleViewSet, basename="instructor-module")
router.register(r"instructor/lessons", LessonViewSet, basename="instructor-lesson")

urlpatterns = [
    path("", include(router.urls)),
    # Nested routes for modules and lessons
    path(
        "courses/<uuid:course_id>/modules/",
        CourseModulesView.as_view(),
        name="course-modules",
    ),
    path(
        "modules/<uuid:module_id>/lessons/",
        ModuleLessonsView.as_view(),
        name="module-lessons",
    ),
]
