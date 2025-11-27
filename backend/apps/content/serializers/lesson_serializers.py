from apps.content.models import Lesson
from rest_framework import serializers


class LessonListSerializer(serializers.ModelSerializer):
    """Minimal lesson info for listing (used in module detail)."""

    class Meta:
        model = Lesson
        fields = ["id", "title", "type", "duration", "order"]


# class LessonDetailSerializer(serializers.ModelSerializer):
#     """Full lesson detail for public view."""

#     module_title = serializers.CharField(source="module.title", read_only=True)
#     course_title = serializers.CharField(source="module.course.title", read_only=True)

#     class Meta:
#         model = Lesson
#         fields = [
#             "id",
#             "title",
#             "type",
#             "duration",
#             "order",
#             "content",
#             "module_title",
#             "course_title",
#         ]


class InstructorLessonSerializer(serializers.ModelSerializer):
    """Lesson serializer for instructor CRUD operations."""

    course_title = serializers.CharField(source="module.course.title", read_only=True)
    module_title = serializers.CharField(source="module.title", read_only=True)

    class Meta:
        model = Lesson
        fields = [
            "id",
            "module",
            "title",
            "type",
            "duration",
            "order",
            "content",
            "module_title",
            "course_title",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    # def validate_module(self, value):
    #     """Ensure instructor owns the module's course."""
    #     request = self.context.get("request")
    #     if request and hasattr(request, "user"):
    #         if value.course.instructor != request.user:
    #             raise serializers.ValidationError(
    #                 "You can only add lessons to your own course modules."
    #             )
    #     return value
