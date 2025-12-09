from rest_framework import serializers

from apps.learning_activities.models import Enrollment


class EnrollmentSerializer(serializers.ModelSerializer):
    """Pure enrollment data - no course details."""

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "course_id",
            "status",
            "progress_percent",
            "is_active",
            "enrolled_at",
            "completed_at",
            "last_accessed_at",
        ]
        read_only_fields = fields


class EnrollmentWithCourseRefSerializer(serializers.ModelSerializer):
    """Enrollment with minimal course reference for lists."""

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
            "enrolled_at",
            "completed_at",
            "last_accessed_at",
        ]
        read_only_fields = fields
