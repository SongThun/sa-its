from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.content.serializers import (
    InstructorCourseListSerializer,
    InstructorCourseDetailSerializer,
    InstructorCourseWriteSerializer,
)
from apps.content.permissions import IsInstructor, IsCourseOwner
from apps.content.services import CourseService


class InstructorCourseViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for instructors to manage their courses.

    list: GET /api/instructor/courses/
    create: POST /api/instructor/courses/
    retrieve: GET /api/instructor/courses/{id}/
    update: PUT /api/instructor/courses/{id}/
    partial_update: PATCH /api/instructor/courses/{id}/
    destroy: DELETE /api/instructor/courses/{id}/
    publish: POST /api/instructor/courses/{id}/publish/
    unpublish: POST /api/instructor/courses/{id}/unpublish/
    """

    permission_classes = [IsInstructor, IsCourseOwner]

    def get_queryset(self):
        filters = {
            "level": self.request.query_params.get("level", None),
            "search": self.request.query_params.get("search", None),
            "is_published": self.request.query_params.get("is_published", None),
        }
        return CourseService.get_instructor_courses(self.request.user, filters)

    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == "list":
            return InstructorCourseListSerializer
        elif self.action == "retrieve":
            return InstructorCourseDetailSerializer
        else:  # create, update, partial_update
            return InstructorCourseWriteSerializer

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        course = self.get_object()
        CourseService.publish(course)

        return Response(
            {
                "status": "published",
                "message": f'Course "{course.title}" has been published.',
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        course = self.get_object()
        CourseService.unpublish(course)

        return Response(
            {
                "status": "unpublished",
                "message": f'Course "{course.title}" has been unpublished.',
            },
            status=status.HTTP_200_OK,
        )
