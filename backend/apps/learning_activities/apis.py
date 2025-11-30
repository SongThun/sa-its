from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.content.services import ContentFacade
from apps.learning_activities.services import EnrollmentService, LearningProgressService
from apps.learning_activities.serializers import (
    EnrollmentSerializer,
    EnrolledCourseSerializer,
)


class EnrollView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        if not ContentFacade.published_course_exists(course_id):
            return Response(
                {"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND
            )

        enrollment = EnrollmentService.enroll_by_course_id(request.user, course_id)
        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UnenrollView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        if not ContentFacade.course_exists(course_id):
            return Response(
                {"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND
            )

        result = EnrollmentService.unenroll_by_course_id(request.user, course_id)
        if result:
            return Response(
                {"message": "Successfully unenrolled"}, status=status.HTTP_200_OK
            )
        return Response(
            {"error": "Not enrolled in this course"}, status=status.HTTP_400_BAD_REQUEST
        )


class EnrollmentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        enrollment = EnrollmentService.get_enrollment_by_course_id(
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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        enrollments = EnrollmentService.get_user_enrollments(request.user)
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MyEnrolledCoursesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get("status", None)
        enrollments = EnrollmentService.get_user_enrollments(request.user)

        if status_filter == "ongoing":
            enrollments = enrollments.exclude(status="completed")
        elif status_filter == "completed":
            enrollments = enrollments.filter(status="completed")

        if status_filter == "ongoing":
            enrollments = enrollments.order_by("-last_accessed_at")

        serializer = EnrolledCourseSerializer(enrollments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CourseProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        enrollment = EnrollmentService.get_enrollment_by_course_id(
            request.user, course_id
        )
        if not enrollment:
            return Response(
                {"error": "Not enrolled in this course"},
                status=status.HTTP_404_NOT_FOUND,
            )

        progress = LearningProgressService.get_course_progress(enrollment)
        return Response(progress, status=status.HTTP_200_OK)


class LessonCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id, lesson_id):
        enrollment = EnrollmentService.get_enrollment_by_course_id(
            request.user, course_id
        )
        if not enrollment:
            return Response(
                {"error": "Not enrolled in this course"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not ContentFacade.lesson_exists_in_course(lesson_id, course_id):
            return Response(
                {"error": "Lesson not found in this course"},
                status=status.HTTP_404_NOT_FOUND,
            )

        LearningProgressService.complete_lesson(enrollment, lesson_id)

        progress = LearningProgressService.get_course_progress(enrollment)
        return Response(progress, status=status.HTTP_200_OK)

    def delete(self, request, course_id, lesson_id):
        enrollment = EnrollmentService.get_enrollment_by_course_id(
            request.user, course_id
        )
        if not enrollment:
            return Response(
                {"error": "Not enrolled in this course"},
                status=status.HTTP_404_NOT_FOUND,
            )

        result = LearningProgressService.uncomplete_lesson(enrollment, lesson_id)
        if not result:
            return Response(
                {"error": "Lesson was not marked as completed"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        progress = LearningProgressService.get_course_progress(enrollment)
        return Response(progress, status=status.HTTP_200_OK)
