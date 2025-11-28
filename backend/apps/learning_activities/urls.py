from django.urls import path

from apps.learning_activities.apis import (
    EnrollView,
    UnenrollView,
    EnrollmentStatusView,
    MyEnrollmentsView,
)

urlpatterns = [
    path("enrollments/", MyEnrollmentsView.as_view(), name="my-enrollments"),
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
]
