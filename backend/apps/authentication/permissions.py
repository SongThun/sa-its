"""
Custom permission classes for role-based access control.
"""

from rest_framework import permissions


class IsInstructor(permissions.BasePermission):
    """
    Permission check for instructor role.
    Allows access only to users with instructor role.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "instructor"
        )


class IsStudent(permissions.BasePermission):
    """
    Permission check for student role.
    Allows access only to users with student role.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "student"
        )


class IsAdmin(permissions.BasePermission):
    """
    Permission check for admin role.
    Allows access only to users with admin role.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )


class IsInstructorOrReadOnly(permissions.BasePermission):
    """
    Permission that allows instructors full access,
    but read-only for others.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "instructor"
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions only to the owner
        return obj.user == request.user or obj == request.user
