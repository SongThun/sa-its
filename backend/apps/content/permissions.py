"""
Permissions for Content Management module.
"""

from rest_framework import permissions


class IsInstructor(permissions.BasePermission):
    """
    Permission check for instructor role.
    Only users with instructor role can access.
    """

    def has_permission(self, request, view):  # noqa: ARG002
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "instructor"
        )


class IsCourseOwner(permissions.BasePermission):
    """
    Permission to check if user is the course owner/instructor.
    Works for Course, Module, and Lesson objects.
    """

    def has_object_permission(self, request, view, obj):
        # Check if user is the instructor of the course
        if hasattr(obj, "instructor"):
            return obj.instructor == request.user
        # For Module - check course instructor
        if hasattr(obj, "course"):
            return obj.course.instructor == request.user
        # For Lesson - check module's course instructor
        if hasattr(obj, "module"):
            return obj.module.course.instructor == request.user

        return False


class IsInstructorOrReadOnly(permissions.BasePermission):
    """
    Custom permission: instructors can edit their own courses, everyone can read.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        # Check if user is the instructor
        if hasattr(obj, "instructor"):
            return obj.instructor == request.user
        if hasattr(obj, "course"):
            return obj.course.instructor == request.user
        if hasattr(obj, "module"):
            return obj.module.course.instructor == request.user

        return False
