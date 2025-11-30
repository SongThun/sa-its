from django.urls import path

from apps.learning_activities.apis import (
    EnrollView,
    UnenrollView,
    EnrollmentStatusView,
    MyEnrollmentsView,
    MyEnrolledCoursesView,
    CourseProgressView,
    LessonCompleteView,
)

urlpatterns = [
    path("enrollments/", MyEnrollmentsView.as_view(), name="my-enrollments"),
    path("my-courses/", MyEnrolledCoursesView.as_view(), name="my-enrolled-courses"),
    path(
        "courses/<uuid:course_id>/enroll/", EnrollView.as_view(), name="course-enroll"
    ),
    path(
        "courses/<uuid:course_id>/unenroll/",
        UnenrollView.as_view(),
        name="course-unenroll",
    ),
    path(
        "courses/<uuid:course_id>/enrollment-status/",
        EnrollmentStatusView.as_view(),
        name="enrollment-status",
    ),
    # Learning Progress endpoints
    path(
        "courses/<uuid:course_id>/progress/",
        CourseProgressView.as_view(),
        name="course-progress",
    ),
    path(
        "courses/<uuid:course_id>/lessons/<uuid:lesson_id>/complete/",
        LessonCompleteView.as_view(),
        name="lesson-complete",
    ),
]
