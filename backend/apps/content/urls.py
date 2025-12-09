from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.content.apis import (
    CoursePublicViewSet,
    CourseInstructorViewSet,
    ModuleInstructorViewSet,
    LessonInstructorViewSet,
    CategoryViewSet,
    TopicViewSet,
)

router = DefaultRouter()

# Public endpoints
router.register(r"courses", CoursePublicViewSet, basename="course")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"topics", TopicViewSet, basename="topic")

# Instructor endpoints (parent IDs passed in request body)
router.register(
    r"instructor/courses", CourseInstructorViewSet, basename="instructor-course"
)
router.register(
    r"instructor/modules", ModuleInstructorViewSet, basename="instructor-module"
)
router.register(
    r"instructor/lessons", LessonInstructorViewSet, basename="instructor-lesson"
)

urlpatterns = [
    path("", include(router.urls)),
]
