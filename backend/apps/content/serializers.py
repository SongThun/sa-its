from rest_framework import serializers

from apps.content.models import Course, Category, Module, Lesson, Topic


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "description"]


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ["id", "name", "slug", "description", "created_at", "updated_at"]


class TopicListSerializer(serializers.ModelSerializer):
    """Lightweight topic serializer for embedding in other models."""

    class Meta:
        model = Topic
        fields = ["id", "name", "slug"]


class LessonListSerializer(serializers.ModelSerializer):
    """Lesson metadata for list views."""

    topics = TopicListSerializer(many=True, read_only=True)

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
            "created_at",
            "updated_at",
        ]


class LessonDetailSerializer(serializers.ModelSerializer):
    """Full lesson detail including content."""

    topics = TopicListSerializer(many=True, read_only=True)
    content_data = serializers.SerializerMethodField()

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

    def get_content_data(self, obj):
        """Return content_data with fallback to legacy content field."""
        return obj.get_content()


class ModuleSerializer(serializers.ModelSerializer):
    """Module with full lesson list (for enrolled users)."""

    lessons = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()

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

    def get_lessons(self, obj):
        """Filter lessons based on user role - instructors see all, others see published only."""
        request = self.context.get("request")
        lessons = obj.lessons.all()

        if request and request.user.is_authenticated:
            if hasattr(request.user, "role") and request.user.role == "instructor":
                return LessonDetailSerializer(lessons, many=True).data
            if obj.course.instructor == request.user:
                return LessonDetailSerializer(lessons, many=True).data
        return LessonDetailSerializer(lessons.filter(is_published=True), many=True).data

    def get_total_lessons(self, obj):
        request = self.context.get("request")
        lessons = obj.lessons.all()
        if request and request.user.is_authenticated:
            if hasattr(request.user, "role") and request.user.role == "instructor":
                return lessons.count()
            if obj.course.instructor == request.user:
                return lessons.count()
        return lessons.filter(is_published=True).count()


class LessonLockedSerializer(serializers.ModelSerializer):
    """Lesson with title only (for non-enrolled users)."""

    class Meta:
        model = Lesson
        fields = ["id", "title", "content_type", "order", "estimated_duration"]


class ModuleLockedSerializer(serializers.ModelSerializer):
    """Module with lesson titles only (for non-enrolled users)."""

    lessons = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = [
            "id",
            "title",
            "description",
            "order",
            "estimated_duration",
            "total_lessons",
            "lessons",
        ]

    def get_lessons(self, obj):
        """Show only published lessons with minimal info."""
        lessons = obj.lessons.filter(is_published=True)
        return LessonLockedSerializer(lessons, many=True).data

    def get_total_lessons(self, obj):
        """Count only published lessons."""
        return obj.lessons.filter(is_published=True).count()


class CourseListSerializer(serializers.ModelSerializer):
    """Serializer for course list view."""

    category = serializers.CharField(source="category.name", read_only=True)
    instructor_name = serializers.CharField(
        source="instructor.full_name", read_only=True
    )
    total_lessons = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "difficulty_level",
            "est_duration",
            "cover_image",
            "students_count",
            "rating",
            "category",
            "instructor_name",
            "total_lessons",
            "is_published",
            "created_at",
            "updated_at",
        ]

    def get_total_lessons(self, obj):
        """Count lessons based on user role."""
        request = self.context.get("request")
        lessons = Lesson.objects.filter(module__course=obj)
        if request and request.user.is_authenticated:
            if hasattr(request.user, "role") and request.user.role == "instructor":
                return lessons.count()
            if obj.instructor == request.user:
                return lessons.count()
        return lessons.filter(is_published=True, module__is_published=True).count()


class CourseDetailSerializer(serializers.ModelSerializer):
    """Full course detail for enrolled users."""

    category = serializers.CharField(source="category.name", read_only=True)
    instructor_name = serializers.CharField(
        source="instructor.full_name", read_only=True
    )
    modules = serializers.SerializerMethodField()
    prerequisites = CourseListSerializer(many=True, read_only=True)
    total_lessons = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "difficulty_level",
            "est_duration",
            "cover_image",
            "students_count",
            "rating",
            "category",
            "instructor_name",
            "modules",
            "prerequisites",
            "total_lessons",
            "is_published",
            "created_at",
            "updated_at",
        ]

    def get_modules(self, obj):
        """Filter modules based on user role - instructors see all, others see published only."""
        request = self.context.get("request")
        modules = obj.modules.all()
        # Instructors see all modules
        if request and request.user.is_authenticated:
            if hasattr(request.user, "role") and request.user.role == "instructor":
                return ModuleSerializer(modules, many=True, context=self.context).data
            if obj.instructor == request.user:
                return ModuleSerializer(modules, many=True, context=self.context).data
        # Others see only published modules
        return ModuleSerializer(
            modules.filter(is_published=True), many=True, context=self.context
        ).data

    def get_total_lessons(self, obj):
        """Count lessons based on user role."""
        request = self.context.get("request")
        lessons = Lesson.objects.filter(module__course=obj)
        if request and request.user.is_authenticated:
            if hasattr(request.user, "role") and request.user.role == "instructor":
                return lessons.count()
            if obj.instructor == request.user:
                return lessons.count()
        return lessons.filter(is_published=True, module__is_published=True).count()


class CourseDetailLockedSerializer(serializers.ModelSerializer):
    """Limited course detail for non-enrolled users (no lessons shown)."""

    category = serializers.CharField(source="category.name", read_only=True)
    instructor_name = serializers.CharField(
        source="instructor.full_name", read_only=True
    )
    modules = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "difficulty_level",
            "est_duration",
            "cover_image",
            "students_count",
            "rating",
            "category",
            "instructor_name",
            "modules",
            "total_lessons",
            "created_at",
            "updated_at",
        ]

    def get_modules(self, obj):
        """Show only published modules for non-enrolled users."""
        modules = obj.modules.filter(is_published=True)
        return ModuleLockedSerializer(modules, many=True).data

    def get_total_lessons(self, obj):
        """Count only published lessons in published modules."""
        return Lesson.objects.filter(
            module__course=obj, is_published=True, module__is_published=True
        ).count()


class CourseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating courses."""

    category_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Course
        fields = [
            "title",
            "description",
            "difficulty_level",
            "est_duration",
            "cover_image",
            "category_id",
        ]


class CourseUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating courses."""

    category_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Course
        fields = [
            "title",
            "description",
            "difficulty_level",
            "est_duration",
            "cover_image",
            "category_id",
            "is_published",
        ]


class ModuleModelSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating modules."""

    class Meta:
        model = Module
        fields = ["title", "description", "order", "estimated_duration", "is_published"]


class LessonModelSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating lessons."""

    topic_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    content_data = serializers.JSONField(required=False, default=dict)

    class Meta:
        model = Lesson
        fields = [
            "title",
            "content",
            "content_data",
            "content_type",
            "order",
            "estimated_duration",
            "is_published",
            "topic_ids",
        ]
