from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.content.models import Lesson, Module
from apps.content.serializers import (
    LessonDetailSerializer,
    LessonListSerializer,
    LessonCreateSerializer,
    LessonUpdateSerializer,
)
from apps.content.permissions import IsInstructor


class LessonViewSet(viewsets.ModelViewSet):
    """API for managing lessons within a module."""

    permission_classes = [IsAuthenticated, IsInstructor]

    def get_serializer_class(self):
        actions = {
            "list": LessonListSerializer,
            "retrieve": LessonDetailSerializer,
            "create": LessonCreateSerializer,
            "update": LessonUpdateSerializer,
            "partial_update": LessonUpdateSerializer,
        }
        return actions.get(self.action, LessonDetailSerializer)

    def get_queryset(self):
        """Get lessons for instructor's courses only."""
        return Lesson.objects.filter(module__course__instructor=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def create(self, request, *args, **kwargs):
        module_id = request.data.get("module_id")
        if not module_id:
            return Response(
                {"error": "module_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            module = Module.objects.get(id=module_id, course__instructor=request.user)
        except Module.DoesNotExist:
            return Response(
                {"error": "Module not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(module=module)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        lesson = self.get_object()
        lesson.is_published = True
        lesson.save(update_fields=["is_published", "updated_at"])
        return Response({"detail": f"Lesson '{lesson.title}' published"})

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        lesson = self.get_object()
        lesson.is_published = False
        lesson.save(update_fields=["is_published", "updated_at"])
        return Response({"detail": f"Lesson '{lesson.title}' unpublished"})
