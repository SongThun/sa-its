from apps.content.models import Category, Course
from rest_framework import serializers

from .module_serializers import ModuleDetailSerializer


class CategorySerializer(serializers.ModelSerializer):
    courses_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "description", "courses_count"]

    def get_courses_count(self, obj):
        return obj.courses.filter(is_published=True).count()


class CourseListSerializer(serializers.ModelSerializer):
    """Course list serializer for public view."""

    category = serializers.StringRelatedField()
    instructor_name = serializers.CharField(
        source="instructor.fullname", read_only=True
    )
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


class CourseDetailSerializer(serializers.ModelSerializer):
    """Course detail serializer for public view with modules and lessons."""

    category = CategorySerializer(read_only=True)
    modules = ModuleDetailSerializer(many=True, read_only=True)
    instructor_name = serializers.CharField(
        source="instructor.fullname", read_only=True
    )
    total_lessons = serializers.SerializerMethodField()

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

    def get_total_lessons(self, obj):
        return sum(module.lessons.count() for module in obj.modules.all())


class InstructorCourseListSerializer(serializers.ModelSerializer):
    """Course list serializer for instructor view."""

    category_name = serializers.CharField(source="category.name", read_only=True)
    total_lessons = serializers.IntegerField(read_only=True)
    total_modules = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "thumbnail",
            "duration",
            "level",
            "category_name",
            "is_published",
            "rating",
            "students_count",
            "total_lessons",
            "total_modules",
            "created_at",
            "updated_at",
        ]

    def get_total_modules(self, obj):
        return obj.modules.count()


class InstructorCourseDetailSerializer(serializers.ModelSerializer):
    """Course detail serializer for instructor with full modules and lessons."""

    category = CategorySerializer(read_only=True)
    modules = ModuleDetailSerializer(many=True, read_only=True)
    total_lessons = serializers.SerializerMethodField()
    total_modules = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "thumbnail",
            "duration",
            "level",
            "category",
            "is_published",
            "rating",
            "students_count",
            "modules",
            "total_lessons",
            "total_modules",
            "created_at",
            "updated_at",
        ]

    def get_total_lessons(self, obj):
        return sum(module.lessons.count() for module in obj.modules.all())

    def get_total_modules(self, obj):
        return obj.modules.count()


class InstructorCourseWriteSerializer(serializers.ModelSerializer):
    """Course serializer for instructor create/update operations."""

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
