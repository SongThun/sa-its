from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.content.serializers import (
    LessonDetailSerializer,
    LessonListSerializer,
    LessonModelSerializer,
)
from apps.content.permissions import IsInstructor, IsOwner
from apps.content.services import ContentFacade, LessonService, ModuleService


class LessonViewSet(viewsets.ModelViewSet):
    """API for managing lessons within a module."""

    permission_classes = [IsAuthenticated, IsInstructor]

    def get_serializer_class(self):
        actions = {
            "list": LessonListSerializer,
            "retrieve": LessonDetailSerializer,
            "create": LessonModelSerializer,
            "update": LessonModelSerializer,
            "partial_update": LessonModelSerializer,
        }
        return actions.get(self.action, LessonDetailSerializer)

    def get_queryset(self):
        return ContentFacade.get_lessons_for_instructor(self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        module_id = request.data.get("module_id")
        if not module_id:
            return Response(
                {"error": "module_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        lesson = ContentFacade.add_lesson_to_module(
            instructor=self.request.user,
            module_id=module_id,
            lesson_data=serializer.validated_data,
        )
        if not lesson:
            return Response(
                {"error": "Module not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = LessonDetailSerializer(
            lesson, context=self.get_serializer_context()
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)

        # Validate ownership and resolve topic_ids through service
        result = ContentFacade.resolve_lesson_update(
            instructor=request.user,
            lesson_id=kwargs.get("pk"),
            lesson_data=request.data,
        )

        if result[0] is None:
            return Response(
                {"error": "Lesson not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND,
            )

        lesson, validated_data, topic_ids = result

        # Use serializer to update with validated data (without topic_ids)
        serializer = self.get_serializer(lesson, data=validated_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        lesson = serializer.save()

        # Update topics if provided (via ContentFacade to maintain layer separation)
        ContentFacade.set_lesson_topics(lesson, topic_ids)

        response_serializer = LessonDetailSerializer(
            lesson, context=self.get_serializer_context()
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated, IsInstructor, IsOwner],
    )
    def publish(self, request, pk=None):
        lesson = self.get_object()
        ContentFacade.publish_lesson(lesson)
        serializer = LessonDetailSerializer(
            lesson, context=self.get_serializer_context()
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated, IsInstructor, IsOwner],
    )
    def unpublish(self, request, pk=None):
        lesson = self.get_object()
        ContentFacade.unpublish_lesson(lesson)
        serializer = LessonDetailSerializer(
            lesson, context=self.get_serializer_context()
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


class ModuleLessonsView(APIView):
    """List lessons for a specific module (public endpoint)."""

    permission_classes = [AllowAny]

    def get(self, request, module_id):
        module = ModuleService.get_by_id(module_id)
        if not module:
            return Response(
                {"error": "Module not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Check if module's course is published
        if not module.course.is_published:
            return Response(
                {"error": "Module not found"}, status=status.HTTP_404_NOT_FOUND
            )

        lessons = LessonService.get_by_module(module_id)
        # Only show published lessons for public access
        is_instructor = (
            request.user.is_authenticated and request.user == module.course.instructor
        )
        if not is_instructor:
            lessons = lessons.filter(is_published=True)

        serializer = LessonDetailSerializer(
            lessons, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
