from rest_framework import serializers

from apps.content.models import Course, Category, Module, Lesson, Topic


# ==================== BASE SERIALIZERS ====================


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "description"]


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ["id", "name", "slug", "description", "created_at", "updated_at"]


class TopicMinimalSerializer(serializers.ModelSerializer):
    """Lightweight topic serializer for embedding."""

    class Meta:
        model = Topic
        fields = ["id", "name", "slug"]


# ==================== LESSON SERIALIZERS ====================


class LessonMinimalSerializer(serializers.ModelSerializer):
    """Lesson for locked/public view - no content."""

    class Meta:
        model = Lesson
        fields = ["id", "title", "content_type", "order", "estimated_duration"]


class LessonListSerializer(serializers.ModelSerializer):
    """Lesson for enrolled users - includes topics."""

    topics = TopicMinimalSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = [
            "id",
            "title",
            "content_type",
            "order",
            "estimated_duration",
            "is_published",
            "topics",
        ]


class LessonDetailSerializer(serializers.ModelSerializer):
    """Full lesson detail with content."""

    topics = TopicMinimalSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = [
            "id",
            "title",
            "content",
            "content_data",
            "content_type",
            "order",
            "estimated_duration",
            "is_published",
            "topics",
            "created_at",
            "updated_at",
        ]


class LessonWriteSerializer(serializers.ModelSerializer):
    """Create/Update lesson."""

    module_id = serializers.PrimaryKeyRelatedField(
        queryset=Module.objects.all(),
        source="module",
        write_only=True,
    )
    topic_ids = serializers.PrimaryKeyRelatedField(
        queryset=Topic.objects.all(),
        many=True,
        write_only=True,
        required=False,
    )

    class Meta:
        model = Lesson
        fields = [
            "id",
            "module_id",
            "title",
            "content",
            "content_data",
            "content_type",
            "order",
            "estimated_duration",
            "is_published",
            "topic_ids",
        ]

    def create(self, validated_data):
        topics = validated_data.pop("topic_ids", [])
        lesson = super().create(validated_data)
        if topics:
            lesson.topics.set(topics)
        return lesson

    def update(self, instance, validated_data):
        topics = validated_data.pop("topic_ids", None)
        lesson = super().update(instance, validated_data)
        if topics is not None:
            lesson.topics.set(topics)
        return lesson


# ==================== MODULE SERIALIZERS ====================


class ModuleMinimalSerializer(serializers.ModelSerializer):
    """Module for locked/public view - lesson count only."""

    total_lessons = serializers.IntegerField(read_only=True)

    class Meta:
        model = Module
        fields = [
            "id",
            "title",
            "description",
            "order",
            "estimated_duration",
            "total_lessons",
        ]


class ModuleWithLessonsSerializer(serializers.ModelSerializer):
    """Module with nested lessons for enrolled users."""

    lessons = LessonListSerializer(many=True, read_only=True)
    total_lessons = serializers.IntegerField(read_only=True)

    class Meta:
        model = Module
        fields = [
            "id",
            "title",
            "description",
            "order",
            "estimated_duration",
            "is_published",
            "total_lessons",
            "lessons",
        ]


class ModuleInstructorSerializer(serializers.ModelSerializer):
    """Module with all fields for instructor."""

    lessons = LessonListSerializer(many=True, read_only=True)
    total_lessons = serializers.IntegerField(read_only=True)

    class Meta:
        model = Module
        fields = [
            "id",
            "title",
            "description",
            "order",
            "estimated_duration",
            "is_published",
            "total_lessons",
            "lessons",
            "created_at",
            "updated_at",
        ]


class ModuleWriteSerializer(serializers.ModelSerializer):
    """Create/Update module."""

    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        source="course",
        write_only=True,
    )

    class Meta:
        model = Module
        fields = [
            "id",
            "course_id",
            "title",
            "description",
            "order",
            "estimated_duration",
            "is_published",
        ]


class ModuleUpdateSerializer(serializers.ModelSerializer):
    """Update module - cannot change course."""

    class Meta:
        model = Module
        fields = ["title", "description", "order", "estimated_duration", "is_published"]


# ==================== COURSE SERIALIZERS ====================


class CourseListSerializer(serializers.ModelSerializer):
    """Course list for public browsing."""

    category = serializers.CharField(source="category.name", read_only=True, default="")
    instructor_name = serializers.CharField(
        source="instructor.full_name", read_only=True, default=""
    )
    total_lessons = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "cover_image",
            "difficulty_level",
            "category",
            "instructor_name",
            "est_duration",
            "rating",
            "students_count",
            "total_lessons",
        ]


class CourseInstructorListSerializer(CourseListSerializer):
    """Course list for instructor - includes publish status and counts."""

    total_lessons = serializers.IntegerField(read_only=True)

    class Meta(CourseListSerializer.Meta):
        fields = CourseListSerializer.Meta.fields + [
            "is_published",
            "total_lessons",
            "created_at",
            "updated_at",
        ]


class CourseDetailLockedSerializer(CourseListSerializer):
    """Course detail for non-enrolled users - modules without lesson content."""

    modules = ModuleMinimalSerializer(many=True, read_only=True)
    total_lessons = serializers.IntegerField(read_only=True)

    class Meta(CourseListSerializer.Meta):
        fields = CourseListSerializer.Meta.fields + ["modules", "total_lessons"]


class CourseDetailSerializer(CourseListSerializer):
    """Course detail for enrolled users - full module/lesson access."""

    modules = ModuleWithLessonsSerializer(many=True, read_only=True)
    total_lessons = serializers.IntegerField(read_only=True)

    class Meta(CourseListSerializer.Meta):
        fields = CourseListSerializer.Meta.fields + [
            "modules",
            "total_lessons",
            "is_published",
        ]


class CourseInstructorDetailSerializer(CourseInstructorListSerializer):
    """Course detail for instructor - all modules/lessons."""

    modules = ModuleInstructorSerializer(many=True, read_only=True)

    class Meta(CourseInstructorListSerializer.Meta):
        fields = CourseInstructorListSerializer.Meta.fields + ["modules"]


class CourseWriteSerializer(serializers.ModelSerializer):
    """Create/Update course."""

    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "cover_image",
            "category_id",
            "difficulty_level",
            "est_duration",
            "is_published",
        ]
