from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.content.models import Topic
from apps.content.permissions import IsInstructor, IsOwner
from apps.content.serializers import (
    LessonDetailSerializer,
    LessonListSerializer,
    LessonModelSerializer,
    TopicSerializer,
)
from apps.content.services import ContentFacade, LessonService

facade = ContentFacade()
lesson_service = LessonService()


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "slug", "description"]


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
        return lesson_service.get_by_instructor(self.request.user)

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

        lesson = facade.add_lesson_to_module(
            instructor=self.request.user,
            module_id=module_id,
            data=serializer.validated_data,
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

        # Validate ownership and resolve topic_ids through facade
        lesson, validated_data, topic_ids = facade.resolve_lesson_update(
            instructor=request.user,
            lesson_id=kwargs.get("pk"),
            data=request.data,
        )

        if lesson is None:
            return Response(
                {"error": "Lesson not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Use serializer to update with validated data (without topic_ids)
        serializer = self.get_serializer(lesson, data=validated_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        lesson = serializer.save()

        # Update topics if provided
        lesson_service.set_topics(lesson, topic_ids)

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
        lesson_service.publish(lesson)
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
        lesson_service.unpublish(lesson)
        serializer = LessonDetailSerializer(
            lesson, context=self.get_serializer_context()
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


class ModuleLessonsView(APIView):
    """List lessons for a specific module (public endpoint)."""

    permission_classes = [AllowAny]

    def get(self, request, module_id):
        module, lessons = facade.get_module_lessons_for_user(module_id, request.user)
        if module is None:
            return Response(
                {"error": "Module not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = LessonDetailSerializer(
            lessons, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
