from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.learning_activities.services import (
    enrollment_facade,
    learning_progress_facade,
)
from apps.learning_activities.serializers import (
    EnrollmentSerializer,
    EnrollmentWithCourseRefSerializer,
)


# ==================== Enrollment Views ====================


class EnrollView(APIView):
    """Enroll user in a course."""

    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        result = enrollment_facade.enroll(request.user, course_id)

        if not result.success:
            return Response({"error": result.error}, status=status.HTTP_404_NOT_FOUND)

        serializer = EnrollmentSerializer(result.enrollment)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UnenrollView(APIView):
    """Unenroll user from a course."""

    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        result = enrollment_facade.unenroll(request.user, course_id)

        if not result.success:
            error_status = (
                status.HTTP_404_NOT_FOUND
                if result.error == "Course not found"
                else status.HTTP_400_BAD_REQUEST
            )
            return Response({"error": result.error}, status=error_status)

        return Response(
            {"message": "Successfully unenrolled"}, status=status.HTTP_200_OK
        )


class EnrollmentStatusView(APIView):
    """Check enrollment status for a course."""

    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        enrollment = enrollment_facade.get_enrollment_by_course_id(
            request.user, course_id
        )

        if enrollment:
            serializer = EnrollmentSerializer(enrollment)
            return Response(
                {"is_enrolled": True, "enrollment": serializer.data},
                status=status.HTTP_200_OK,
            )
        return Response({"is_enrolled": False}, status=status.HTTP_200_OK)


class MyEnrollmentsView(APIView):
    """List user's enrollments."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get("status", None)
        enrollments = enrollment_facade.get_user_enrollments(
            request.user, status_filter=status_filter
        )
        serializer = EnrollmentWithCourseRefSerializer(enrollments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ==================== Learning Progress Views ====================


class CourseProgressView(APIView):
    """Get course progress for enrolled user."""

    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        enrollment = enrollment_facade.get_enrollment_by_course_id(
            request.user, course_id
        )
        if not enrollment:
            return Response(
                {"error": "Not enrolled in this course"},
                status=status.HTTP_404_NOT_FOUND,
            )

        progress = learning_progress_facade.get_course_progress(enrollment)
        return Response(progress, status=status.HTTP_200_OK)


class LessonCompleteView(APIView):
    """Mark lesson as complete/incomplete."""

    permission_classes = [IsAuthenticated]

    def post(self, request, course_id, lesson_id):
        enrollment = enrollment_facade.get_enrollment_by_course_id(
            request.user, course_id
        )
        if not enrollment:
            return Response(
                {"error": "Not enrolled in this course"},
                status=status.HTTP_404_NOT_FOUND,
            )

        result = learning_progress_facade.complete_lesson(enrollment, lesson_id)

        if not result.success:
            return Response({"error": result.error}, status=status.HTTP_400_BAD_REQUEST)

        return Response(result.progress, status=status.HTTP_200_OK)

    def delete(self, request, course_id, lesson_id):
        enrollment = enrollment_facade.get_enrollment_by_course_id(
            request.user, course_id
        )
        if not enrollment:
            return Response(
                {"error": "Not enrolled in this course"},
                status=status.HTTP_404_NOT_FOUND,
            )

        result = learning_progress_facade.uncomplete_lesson(enrollment, lesson_id)

        if not result.success:
            return Response({"error": result.error}, status=status.HTTP_400_BAD_REQUEST)

        return Response(result.progress, status=status.HTTP_200_OK)
