"""
Serializers for Content Management module.
"""

from rest_framework import serializers
from .models import Category, Course, Module, Lesson


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""

    courses_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "description", "icon", "courses_count"]

    def get_courses_count(self, obj):
        return obj.courses.filter(is_published=True).count()


class LessonSerializer(serializers.ModelSerializer):
    """Serializer for Lesson model."""

    class Meta:
        model = Lesson
        fields = [
            "id",
            "title",
            "type",
            "duration",
            "order",
            "content",
            "is_free",
        ]


class LessonListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for lesson lists (without content)."""

    class Meta:
        model = Lesson
        fields = ["id", "title", "type", "duration", "order", "is_free"]


class ModuleSerializer(serializers.ModelSerializer):
    """Serializer for Module model with lessons."""

    lessons = LessonListSerializer(many=True, read_only=True)
    total_lessons = serializers.IntegerField(read_only=True)

    class Meta:
        model = Module
        fields = ["id", "title", "description", "order", "lessons", "total_lessons"]


class ModuleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for module lists."""

    total_lessons = serializers.IntegerField(read_only=True)

    class Meta:
        model = Module
        fields = ["id", "title", "description", "order", "total_lessons"]


class CourseListSerializer(serializers.ModelSerializer):
    """Serializer for course listings."""

    category = serializers.StringRelatedField()
    instructor_name = serializers.SerializerMethodField()
    total_lessons = serializers.IntegerField(read_only=True)
    topics = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "instructor_name",
            "thumbnail",
            "duration",
            "level",
            "category",
            "topics",
            "rating",
            "students_count",
            "total_lessons",
        ]

    def get_instructor_name(self, obj):
        return obj.instructor.full_name

    def get_topics(self, obj):
        """Return list of topic names."""
        return [topic.name for topic in obj.topics.filter(is_active=True)]


class CourseDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single course view."""

    category = CategorySerializer(read_only=True)
    modules = ModuleSerializer(many=True, read_only=True)
    instructor_name = serializers.SerializerMethodField()
    total_lessons = serializers.IntegerField(read_only=True)
    topics = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "instructor_name",
            "thumbnail",
            "duration",
            "level",
            "category",
            "topics",
            "rating",
            "students_count",
            "is_published",
            "modules",
            "total_lessons",
            "created_at",
            "updated_at",
        ]

    def get_instructor_name(self, obj):
        return obj.instructor.full_name

    def get_topics(self, obj):
        """Return detailed topic information."""
        from apps.core.serializers import TopicSerializer

        return TopicSerializer(obj.topics.filter(is_active=True), many=True).data


class CourseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating courses."""

    topic_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False,
        help_text="List of topic UUIDs to associate with the course",
    )

    class Meta:
        model = Course
        fields = [
            "title",
            "description",
            "thumbnail",
            "duration",
            "level",
            "category",
            "topic_ids",
            "is_published",
        ]

    def create(self, validated_data):
        topic_ids = validated_data.pop("topic_ids", [])
        validated_data["instructor"] = self.context["request"].user

        course = super().create(validated_data)

        # Associate topics using service layer
        if topic_ids:
            from apps.core.services import TopicService

            topics = TopicService.get_topics_by_ids(topic_ids)
            course.topics.set(topics)

        return course

    def update(self, instance, validated_data):
        topic_ids = validated_data.pop("topic_ids", None)

        course = super().update(instance, validated_data)

        # Update topics if provided
        if topic_ids is not None:
            from apps.core.services import TopicService

            topics = TopicService.get_topics_by_ids(topic_ids)
            course.topics.set(topics)

        return course


class ModuleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating modules."""

    class Meta:
        model = Module
        fields = ["course", "title", "description", "order"]


class LessonCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating lessons."""

    class Meta:
        model = Lesson
        fields = ["module", "title", "type", "duration", "order", "content", "is_free"]
