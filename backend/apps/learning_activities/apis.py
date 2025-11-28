from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.content.services import ContentFacade
from apps.learning_activities.services import EnrollmentService
from apps.learning_activities.serializers import EnrollmentSerializer


class EnrollView(APIView):
    """Enroll the authenticated user in a course."""

    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        # Validate course exists and is published at view level
        if not ContentFacade.published_course_exists(course_id):
            return Response(
                {"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND
            )

        enrollment = EnrollmentService.enroll_by_course_id(request.user, course_id)
        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UnenrollView(APIView):
    """Unenroll the authenticated user from a course."""

    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        # Validate course exists at view level
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
    """Check enrollment status for a course."""

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
    """Get all enrollments for the authenticated user."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        enrollments = EnrollmentService.get_user_enrollments(request.user)
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
