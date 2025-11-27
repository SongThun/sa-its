"""
Instructor APIs for Content module.
Full CRUD access for instructors to manage their own courses, modules, and lessons.
"""

from rest_framework import viewsets, mixins
from apps.content.serializers import (
    InstructorModuleSerializer,
    InstructorLessonSerializer,
)
from apps.content.permissions import IsInstructor, IsCourseOwner
from apps.content.services import ModuleService, LessonService


class InstructorModuleViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for instructors to manage modules in their courses.

    list: GET /api/instructor/modules/?course_id={id}
    create: POST /api/instructor/modules/
    retrieve: GET /api/instructor/modules/{id}/
    update: PUT /api/instructor/modules/{id}/
    partial_update: PATCH /api/instructor/modules/{id}/
    destroy: DELETE /api/instructor/modules/{id}/
    """

    serializer_class = InstructorModuleSerializer
    permission_classes = [IsInstructor, IsCourseOwner]

    def get_queryset(self):
        """Get modules for the instructor's courses."""
        course_id = self.request.query_params.get("course_id")
        return ModuleService.get_instructor_modules(
            self.request.user, course_id=course_id
        )


class InstructorLessonViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for instructors to manage lessons in their modules.

    list: GET /api/instructor/lessons/?module_id={id}&course_id={id}
    create: POST /api/instructor/lessons/
    retrieve: GET /api/instructor/lessons/{id}/
    update: PUT /api/instructor/lessons/{id}/
    partial_update: PATCH /api/instructor/lessons/{id}/
    destroy: DELETE /api/instructor/lessons/{id}/
    """

    serializer_class = InstructorLessonSerializer
    permission_classes = [IsInstructor, IsCourseOwner]

    def get_queryset(self):
        """Get lessons for the instructor's courses."""
        module_id = self.request.query_params.get("module_id")
        course_id = self.request.query_params.get("course_id")
        return LessonService.get_instructor_lessons(
            self.request.user, module_id=module_id, course_id=course_id
        )
