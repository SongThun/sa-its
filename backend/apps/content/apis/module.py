from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.content.models import Module, Course
from apps.content.serializers import (
    ModuleSerializer,
    ModuleCreateSerializer,
    ModuleUpdateSerializer,
)
from apps.content.permissions import IsInstructor


class ModuleViewSet(viewsets.ModelViewSet):
    """API for managing modules within a course."""

    permission_classes = [IsAuthenticated, IsInstructor]

    def get_serializer_class(self):
        actions = {
            "list": ModuleSerializer,
            "retrieve": ModuleSerializer,
            "create": ModuleCreateSerializer,
            "update": ModuleUpdateSerializer,
            "partial_update": ModuleUpdateSerializer,
        }
        return actions.get(self.action, ModuleSerializer)

    def get_queryset(self):
        """Get modules for instructor's courses only."""
        return Module.objects.filter(course__instructor=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def create(self, request, *args, **kwargs):
        course_id = request.data.get("course_id")
        if not course_id:
            return Response(
                {"error": "course_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            course = Course.objects.get(id=course_id, instructor=request.user)
        except Course.DoesNotExist:
            return Response(
                {"error": "Course not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        module = self.get_object()
        module.is_published = True
        module.save(update_fields=["is_published", "updated_at"])
        return Response({"detail": f"Module '{module.title}' published"})

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        module = self.get_object()
        module.is_published = False
        module.save(update_fields=["is_published", "updated_at"])
        return Response({"detail": f"Module '{module.title}' unpublished"})
