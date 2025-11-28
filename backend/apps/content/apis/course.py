from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.content.serializers import (
    CategorySerializer,
    CourseListSerializer,
    CourseDetailSerializer,
    CourseDetailLockedSerializer,
    CourseCreateSerializer,
    CourseUpdateSerializer,
)
from apps.content.services import ContentFacade
from apps.content.permissions import IsInstructor, IsOwner
from apps.learning_activities.services import EnrollmentService


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for categories."""

    queryset = ContentFacade.get_all_category()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class CoursePublicViewSet(viewsets.ReadOnlyModelViewSet):
    """Public API for browsing courses."""

    serializer_class = CourseListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return ContentFacade.get_published_courses()

    def retrieve(self, request, *args, **kwargs):
        course = self.get_object()
        user = request.user

        if user.is_authenticated and EnrollmentService.is_enrolled(user, course):
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
        return ContentFacade.get_courses_for_instructor(self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Resolve category_id to Category object
        resolved_data = ContentFacade.resolve_course_fks(serializer.validated_data)
        if resolved_data is None:
            return Response(
                {"error": "Invalid category_id"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create course with resolved FKs
        course = serializer.save(instructor=request.user, **resolved_data)
        response_serializer = CourseDetailSerializer(
            course, context=self.get_serializer_context()
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Resolve category_id to Category object
        resolved_data = ContentFacade.resolve_course_fks(serializer.validated_data)
        if resolved_data is None:
            return Response(
                {"error": "Invalid category_id"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update course with resolved FKs
        course = serializer.save(**resolved_data)
        response_serializer = CourseDetailSerializer(
            course, context=self.get_serializer_context()
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @action(
        detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsOwner]
    )
    def publish(self, request, *args, **kwargs):
        course = self.get_object()
        ContentFacade.publish(course)
        course.refresh_from_db()
        serializer = CourseListSerializer(course, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(
        detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsOwner]
    )
    def unpublish(self, request, *args, **kwargs):
        course = self.get_object()
        ContentFacade.unpublish(course)
        course.refresh_from_db()
        serializer = CourseListSerializer(course, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
