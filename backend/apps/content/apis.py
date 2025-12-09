from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied

from apps.content.permissions import IsInstructor, IsOwner
from apps.content.serializers import (
    CategorySerializer,
    TopicSerializer,
    CourseListSerializer,
    CourseDetailSerializer,
    CourseInstructorListSerializer,
    CourseInstructorDetailSerializer,
    CourseWriteSerializer,
    ModuleInstructorSerializer,
    ModuleWriteSerializer,
    ModuleUpdateSerializer,
    LessonListSerializer,
    LessonDetailSerializer,
    LessonWriteSerializer,
)


def get_content_facade():
    """Lazy import to avoid circular import at Django startup."""
    from apps.content.services import content_internal_facade

    return content_internal_facade


# ==================== MIXINS ====================


class PublishableViewSetMixin:
    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        obj = self.get_object()
        obj.publish()
        return Response({"status": "published"})

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        obj = self.get_object()
        obj.unpublish()
        return Response({"status": "unpublished"})


class InstructorContentViewSet(PublishableViewSetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsInstructor]

    owner_actions = [
        "update",
        "partial_update",
        "destroy",
        "retrieve",
        "publish",
        "unpublish",
    ]

    def get_permissions(self):
        if self.action in self.owner_actions:
            return [IsAuthenticated(), IsInstructor(), IsOwner()]
        return super().get_permissions()


# ==================== PUBLIC VIEWSETS ====================


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return get_content_facade().get_all_categories()


class TopicViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TopicSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "slug", "description"]

    def get_queryset(self):
        return get_content_facade().get_all_topics()


class CoursePublicViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public course listing and detail.
    Always returns full course detail - enrollment check done separately via /enrollments/{course_id}/status/
    """

    permission_classes = [AllowAny]

    def get_queryset(self):
        return get_content_facade().get_published_courses_with_content()

    def get_serializer_class(self):
        if self.action == "list":
            return CourseListSerializer
        return CourseDetailSerializer


# ==================== INSTRUCTOR VIEWSETS ====================


class CourseInstructorViewSet(InstructorContentViewSet):
    def get_queryset(self):
        return get_content_facade().get_instructor_courses_with_details(
            self.request.user
        )

    def get_serializer_class(self):
        if self.action == "list":
            return CourseInstructorListSerializer
        if self.action == "retrieve":
            return CourseInstructorDetailSerializer
        return CourseWriteSerializer

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)


class ModuleInstructorViewSet(InstructorContentViewSet):
    def get_queryset(self):
        return get_content_facade().get_instructor_modules_with_lessons(
            self.request.user
        )

    def get_serializer_class(self):
        if self.action == "create":
            return ModuleWriteSerializer
        if self.action in ["update", "partial_update"]:
            return ModuleUpdateSerializer
        return ModuleInstructorSerializer

    def perform_create(self, serializer):
        # Validate ownership of the course before creating module
        course_id = self.request.data.get("course_id")
        if course_id and not get_content_facade().is_course_owner(
            self.request.user, course_id
        ):
            raise PermissionDenied("You don't own this course")
        serializer.save()


class LessonInstructorViewSet(InstructorContentViewSet):
    def get_queryset(self):
        return get_content_facade().get_instructor_lessons_with_topics(
            self.request.user
        )

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return LessonWriteSerializer
        if self.action == "retrieve":
            return LessonDetailSerializer
        return LessonListSerializer

    def perform_create(self, serializer):
        # Validate ownership of the module before creating lesson
        module_id = self.request.data.get("module_id")
        if module_id and not get_content_facade().is_module_owner(
            self.request.user, module_id
        ):
            raise PermissionDenied("You don't own this module")
        serializer.save()
