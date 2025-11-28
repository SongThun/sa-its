from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.content.serializers import (
    CourseListSerializer,
    CourseDetailSerializer,
    CourseDetailLockedSerializer,
    CourseCreateSerializer,
    CourseUpdateSerializer,
)
from apps.content.services.course import CourseService
from apps.content.permissions import IsInstructor, IsOwner


class CoursePublicViewSet(viewsets.ReadOnlyModelViewSet):
    """Public API for browsing courses."""

    serializer_class = CourseListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return CourseService.get_published_courses()

    def retrieve(self, request, *args, **kwargs):
        course = self.get_object()
        user = request.user

        if user.is_authenticated and CourseService.check_enrollment(user, course):
            serializer = CourseDetailSerializer(course)
        else:
            serializer = CourseDetailLockedSerializer(course)

        return Response(serializer.data, status=status.HTTP_200_OK)


class CourseInstructorViewSet(viewsets.ModelViewSet):
    """API for instructors to manage their courses."""

    permission_classes = [IsAuthenticated, IsInstructor]

    def get_permissions(self):
        """Apply IsOwner permission for update, delete, and custom actions."""
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsInstructor(), IsOwner()]
        return super().get_permissions()

    def get_serializer_class(self):
        actions = {
            "list": CourseListSerializer,
            "create": CourseCreateSerializer,
            "update": CourseUpdateSerializer,
            "partial_update": CourseUpdateSerializer,
            "retrieve": CourseDetailSerializer,
        }
        return actions.get(self.action, CourseListSerializer)

    def get_queryset(self):
        return CourseService.get_courses_for_instructor(self.request.user)

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(
        detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsOwner]
    )
    def publish(self, request, *args, **kwargs):
        course = self.get_object()
        CourseService.publish(course)
        course.refresh_from_db()
        serializer = CourseListSerializer(course, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(
        detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsOwner]
    )
    def unpublish(self, request, *args, **kwargs):
        course = self.get_object()
        CourseService.unpublish(course)
        course.refresh_from_db()
        serializer = CourseListSerializer(course, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
