"""
Core Serializers.
Serializers for core models and DTOs for cross-module communication.
"""

from rest_framework import serializers
from .models import Topic, ModuleItem


class TopicSerializer(serializers.ModelSerializer):
    """Serializer for Topic model."""

    class Meta:
        model = Topic
        fields = [
            "id",
            "name",
            "description",
            "slug",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class TopicCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating topics."""

    class Meta:
        model = Topic
        fields = ["name", "description", "slug"]

    def validate_slug(self, value):
        """Validate that slug is unique."""
        if Topic.objects.filter(slug=value).exists():
            raise serializers.ValidationError("Topic with this slug already exists.")
        return value


class TopicListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for topic lists."""

    courses_count = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = ["id", "name", "slug", "courses_count"]

    def get_courses_count(self, obj):
        """Get the number of courses using this topic."""
        return obj.courses.count() if hasattr(obj, "courses") else 0


class ModuleItemSerializer(serializers.ModelSerializer):
    """
    Serializer for ModuleItem with polymorphic content.
    Returns the actual content object based on content_type.
    """

    item_type = serializers.CharField(source="content_type.model", read_only=True)
    content = serializers.SerializerMethodField()

    class Meta:
        model = ModuleItem
        fields = [
            "id",
            "module_id",
            "order",
            "item_type",
            "content",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_content(self, obj):
        """
        Serialize the actual content object.
        Different serializers based on content type.
        """
        content_object = obj.content_object

        if not content_object:
            return None

        # Import serializers dynamically to avoid circular imports
        content_type = obj.content_type.model

        if content_type == "lesson":
            from apps.content.serializers import LessonSerializer

            return LessonSerializer(content_object).data

        elif content_type == "quiz":
            # When assessment module is created
            # from apps.assessment.serializers import QuizSerializer
            # return QuizSerializer(content_object).data
            return {
                "id": content_object.id,
                "title": getattr(content_object, "title", "Quiz"),
            }

        # Default fallback
        return {
            "id": content_object.id,
            "type": content_type,
        }


class ModuleItemCreateSerializer(serializers.Serializer):
    """
    Serializer for creating module items.
    Used to add content to modules.
    """

    module_id = serializers.IntegerField()
    item_type = serializers.ChoiceField(
        choices=["lesson", "quiz", "assignment"], help_text="Type of content to add"
    )
    item_id = serializers.IntegerField(help_text="ID of the content object")
    order = serializers.IntegerField(
        required=False, help_text="Position in module (auto-calculated if not provided)"
    )

    def validate(self, data):
        """Validate that the content object exists."""
        from django.contrib.contenttypes.models import ContentType

        item_type = data["item_type"]
        item_id = data["item_id"]

        # Map item_type to app and model
        type_mapping = {
            "lesson": ("content", "Lesson"),
            "quiz": ("assessment", "Quiz"),
            "assignment": ("assessment", "Assignment"),
        }

        if item_type in type_mapping:
            app_label, model_name = type_mapping[item_type]
            try:
                content_type = ContentType.objects.get(
                    app_label=app_label, model=model_name.lower()
                )
                # Check if object exists
                model_class = content_type.model_class()
                if not model_class.objects.filter(id=item_id).exists():
                    raise serializers.ValidationError(
                        f"{item_type.capitalize()} with id {item_id} does not exist."
                    )
            except ContentType.DoesNotExist:
                raise serializers.ValidationError(
                    f"Content type {item_type} is not available."
                )

        return data


class ModuleItemReorderSerializer(serializers.Serializer):
    """Serializer for reordering module items."""

    items = serializers.ListField(
        child=serializers.DictField(child=serializers.IntegerField()),
        help_text="List of {item_id: new_order} mappings",
    )

    def validate_items(self, value):
        """Validate that all items have id and order."""
        for item in value:
            if "id" not in item or "order" not in item:
                raise serializers.ValidationError(
                    "Each item must have 'id' and 'order' fields."
                )
        return value
