from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.content.apis import (
    CoursePublicViewSet,
    CourseInstructorViewSet,
    ModuleViewSet,
    LessonViewSet,
    CategoryViewSet,
)

router = DefaultRouter()
router.register(r"courses", CoursePublicViewSet, basename="course")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(
    r"instructor/courses", CourseInstructorViewSet, basename="instructor-course"
)
router.register(r"instructor/modules", ModuleViewSet, basename="instructor-module")
router.register(r"instructor/lessons", LessonViewSet, basename="instructor-lesson")

urlpatterns = [
    path("", include(router.urls)),
]
