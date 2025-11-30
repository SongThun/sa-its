from rest_framework import serializers

from apps.learning_activities.models import Enrollment


class EnrollmentSerializer(serializers.ModelSerializer):
    course_id = serializers.UUIDField(source="course.id", read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "course_id",
            "course_title",
            "status",
            "progress_percent",
            "is_active",
            "enrolled_at",
            "completed_at",
            "last_accessed_at",
        ]
        read_only_fields = fields


class EnrolledCourseSerializer(serializers.ModelSerializer):
    enrollment_id = serializers.UUIDField(source="id", read_only=True)
    progress = serializers.DecimalField(
        source="progress_percent", max_digits=5, decimal_places=2, read_only=True
    )
    enrollment_status = serializers.CharField(source="status", read_only=True)
    enrolled_at = serializers.DateTimeField(read_only=True)
    completed_at = serializers.DateTimeField(read_only=True)
    last_accessed_at = serializers.DateTimeField(read_only=True)

    id = serializers.UUIDField(source="course.id", read_only=True)
    title = serializers.CharField(source="course.title", read_only=True)
    description = serializers.CharField(source="course.description", read_only=True)
    cover_image = serializers.URLField(source="course.cover_image", read_only=True)
    difficulty_level = serializers.CharField(
        source="course.difficulty_level", read_only=True
    )
    est_duration = serializers.IntegerField(
        source="course.est_duration", read_only=True
    )
    rating = serializers.DecimalField(
        source="course.rating", max_digits=3, decimal_places=2, read_only=True
    )
    students_count = serializers.IntegerField(
        source="course.students_count", read_only=True
    )
    category = serializers.CharField(source="course.category.name", read_only=True)
    instructor_name = serializers.CharField(
        source="course.instructor.full_name", read_only=True
    )
    total_lessons = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "title",
            "description",
            "cover_image",
            "difficulty_level",
            "est_duration",
            "rating",
            "students_count",
            "category",
            "instructor_name",
            "total_lessons",
            "enrollment_id",
            "progress",
            "enrollment_status",
            "enrolled_at",
            "completed_at",
            "last_accessed_at",
        ]

    def get_total_lessons(self, obj):
        from apps.content.models import Lesson

        return Lesson.objects.filter(
            module__course=obj.course,
            is_published=True,
            module__is_published=True,
        ).count()
