"""
Serializers for Content Management module.
"""

from rest_framework import serializers
from .models import Category, Course, Module, Lesson, LearningObject


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
            "rating",
            "students_count",
            "total_lessons",
        ]

    def get_instructor_name(self, obj):
        return obj.instructor.full_name


class CourseDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single course view."""

    category = CategorySerializer(read_only=True)
    modules = ModuleSerializer(many=True, read_only=True)
    instructor_name = serializers.SerializerMethodField()
    total_lessons = serializers.IntegerField(read_only=True)

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


class CourseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating courses."""

    class Meta:
        model = Course
        fields = [
            "title",
            "description",
            "thumbnail",
            "duration",
            "level",
            "category",
            "is_published",
        ]

    def create(self, validated_data):
        validated_data["instructor"] = self.context["request"].user
        return super().create(validated_data)


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


class LearningObjectSerializer(serializers.ModelSerializer):
    """Serializer for LearningObject model."""

    class Meta:
        model = LearningObject
        fields = [
            "id",
            "lesson",
            "title",
            "type",
            "content",
            "difficulty",
            "estimated_time",
        ]
