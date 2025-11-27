from apps.content.models import Module
from rest_framework import serializers

from .lesson_serializers import LessonListSerializer


class ModuleListSerializer(serializers.ModelSerializer):
    """Minimal module info for listing."""

    total_lessons = serializers.IntegerField(read_only=True)

    class Meta:
        model = Module
        fields = ["id", "title", "description", "order", "total_lessons"]


class ModuleDetailSerializer(serializers.ModelSerializer):
    """Module detail with lessons for public view."""

    lessons = LessonListSerializer(many=True, read_only=True)
    total_lessons = serializers.SerializerMethodField()
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = Module
        fields = [
            "id",
            "title",
            "description",
            "order",
            "course_title",
            "lessons",
            "total_lessons",
        ]

    def get_total_lessons(self, obj):
        return obj.lessons.count()


class InstructorModuleSerializer(serializers.ModelSerializer):
    """Module serializer for instructor CRUD operations."""

    lessons = LessonListSerializer(many=True, read_only=True)
    total_lessons = serializers.SerializerMethodField()
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = Module
        fields = [
            "id",
            "course",
            "title",
            "description",
            "order",
            "course_title",
            "lessons",
            "total_lessons",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_total_lessons(self, obj):
        return obj.lessons.count()

    # def validate_course(self, value):
    #     """Ensure instructor owns the course."""
    #     request = self.context.get("request")
    #     if request and hasattr(request, "user"):
    #         if value.instructor != request.user:
    #             raise serializers.ValidationError("You can only add modules to your own courses.")
    #     return value
