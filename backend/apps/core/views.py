"""
Core API Views.
Provides RESTful endpoints for core shared resources (Topics, ModuleItems).
Following the module view architecture with API/Business/Persistence layers.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Count

from .models import Topic
from .serializers import (
    TopicSerializer,
    TopicListSerializer,
    TopicCreateSerializer,
    ModuleItemSerializer,
    ModuleItemCreateSerializer,
    ModuleItemReorderSerializer,
)
from .services import TopicService, ModuleItemService


# ============================================================================
# TOPIC VIEWS - Topic management and filtering
# ============================================================================


class TopicListView(generics.ListAPIView):
    """
    List all active topics.
    GET /api/core/topics/

    Query Parameters:
    - search: Search in topic name/description
    """

    serializer_class = TopicListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = TopicService.get_all_active_topics()

        # Search functionality
        search = self.request.query_params.get("search")
        if search:
            queryset = TopicService.search_topics(search)

        # Annotate with course count for the list view
        return Topic.objects.filter(id__in=[t.id for t in queryset]).annotate(
            courses_count=Count("courses")
        )


class TopicDetailView(generics.RetrieveAPIView):
    """
    Get topic details by ID.
    GET /api/core/topics/{id}/
    """

    serializer_class = TopicSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        topic_id = self.kwargs.get("pk")
        topic = TopicService.get_topic_by_id(topic_id)

        if not topic:
            from rest_framework.exceptions import NotFound

            raise NotFound("Topic not found.")

        return topic


class TopicCreateView(generics.CreateAPIView):
    """
    Create a new topic (authenticated users only).
    POST /api/core/topics/

    Body:
    {
        "name": "Python Programming",
        "slug": "python-programming",
        "description": "Learn Python from scratch"
    }
    """

    serializer_class = TopicCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Use service layer for business logic
        TopicService.create_topic(
            name=serializer.validated_data["name"],
            description=serializer.validated_data.get("description", ""),
            slug=serializer.validated_data.get("slug"),
            user=self.request.user,
        )


class TopicUpdateView(generics.UpdateAPIView):
    """
    Update an existing topic.
    PUT/PATCH /api/core/topics/{id}/
    """

    serializer_class = TopicCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        topic_id = self.kwargs.get("pk")
        topic = TopicService.get_topic_by_id(topic_id)

        if not topic:
            from rest_framework.exceptions import NotFound

            raise NotFound("Topic not found.")

        return topic

    def perform_update(self, serializer):
        topic_id = self.kwargs.get("pk")
        TopicService.update_topic(
            topic_id=topic_id,
            name=serializer.validated_data.get("name"),
            description=serializer.validated_data.get("description"),
            slug=serializer.validated_data.get("slug"),
        )


class TopicDeleteView(generics.DestroyAPIView):
    """
    Soft delete a topic (mark as inactive).
    DELETE /api/core/topics/{id}/
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        topic_id = self.kwargs.get("pk")
        topic = TopicService.get_topic_by_id(topic_id)

        if not topic:
            from rest_framework.exceptions import NotFound

            raise NotFound("Topic not found.")

        return topic

    def perform_destroy(self, instance):
        TopicService.deactivate_topic(instance.id)


class TopicCoursesView(generics.ListAPIView):
    """
    Get all courses for a specific topic.
    GET /api/core/topics/{id}/courses/
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        topic_id = self.kwargs.get("pk")
        topic = TopicService.get_topic_by_id(topic_id)

        if not topic:
            return Response(
                {"error": "Topic not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Use content serializers (avoid circular import)
        from apps.content.serializers import CourseListSerializer

        courses = topic.courses.filter(is_published=True).annotate(
            total_lessons=Count("modules__lessons")
        )

        serializer = CourseListSerializer(courses, many=True)
        return Response(serializer.data)


# ============================================================================
# MODULE ITEM VIEWS - Polymorphic content ordering
# ============================================================================


class ModuleItemListView(generics.ListAPIView):
    """
    Get all ordered items (lessons, quizzes, etc.) for a module.
    GET /api/core/modules/{module_id}/items/

    Returns items in order with their content objects.
    """

    serializer_class = ModuleItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        module_id = self.kwargs.get("module_id")
        return ModuleItemService.get_module_items(module_id)


class ModuleItemCreateView(generics.CreateAPIView):
    """
    Add an item (lesson, quiz, assignment) to a module.
    POST /api/core/modules/{module_id}/items/

    Body:
    {
        "item_type": "lesson",  // or "quiz", "assignment"
        "item_id": "uuid-of-lesson",
        "order": 0  // optional, auto-calculated if not provided
    }
    """

    serializer_class = ModuleItemCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        module_id = serializer.validated_data["module_id"]
        item_type = serializer.validated_data["item_type"]
        item_id = serializer.validated_data["item_id"]
        order = serializer.validated_data.get("order")

        # Get the actual content object
        from django.contrib.contenttypes.models import ContentType

        type_mapping = {
            "lesson": ("content", "lesson"),
            "quiz": ("assessment", "quiz"),
            "assignment": ("assessment", "assignment"),
        }

        app_label, model_name = type_mapping[item_type]
        content_type = ContentType.objects.get(app_label=app_label, model=model_name)

        item_object = content_type.model_class().objects.get(id=item_id)

        # Use service layer
        ModuleItemService.add_item_to_module(
            module_id=module_id, item_object=item_object, order=order
        )


class ModuleItemReorderView(generics.UpdateAPIView):
    """
    Reorder items in a module.
    PUT /api/core/modules/{module_id}/items/reorder/

    Body:
    {
        "items": [
            {"id": "item-uuid-1", "order": 0},
            {"id": "item-uuid-2", "order": 1},
            {"id": "item-uuid-3", "order": 2}
        ]
    }
    """

    serializer_class = ModuleItemReorderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        module_id = self.kwargs.get("module_id")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Convert to dict for service
        items = serializer.validated_data["items"]
        item_orders = {item["id"]: item["order"] for item in items}

        success = ModuleItemService.reorder_items(module_id, item_orders)

        if success:
            return Response({"message": "Items reordered successfully."})
        else:
            return Response(
                {"error": "Failed to reorder items."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ModuleItemDeleteView(generics.DestroyAPIView):
    """
    Remove an item from a module.
    DELETE /api/core/module-items/{id}/

    Note: This only removes the ordering entry, not the content itself.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        item_id = self.kwargs.get("pk")
        item = ModuleItemService.get_item_by_id(item_id)

        if not item:
            from rest_framework.exceptions import NotFound

            raise NotFound("Module item not found.")

        return item

    def perform_destroy(self, instance):
        ModuleItemService.remove_item(instance.id)


class ModuleItemMoveView(generics.UpdateAPIView):
    """
    Move a single item to a new position in the module.
    PATCH /api/core/module-items/{id}/move/

    Body:
    {
        "new_order": 3
    }
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        item_id = self.kwargs.get("pk")
        item = ModuleItemService.get_item_by_id(item_id)

        if not item:
            from rest_framework.exceptions import NotFound

            raise NotFound("Module item not found.")

        return item

    def update(self, request, *args, **kwargs):
        item_id = self.kwargs.get("pk")
        new_order = request.data.get("new_order")

        if new_order is None:
            return Response(
                {"error": "new_order is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        success = ModuleItemService.move_item(item_id, new_order)

        if success:
            return Response({"message": "Item moved successfully."})
        else:
            return Response(
                {"error": "Failed to move item."}, status=status.HTTP_400_BAD_REQUEST
            )
