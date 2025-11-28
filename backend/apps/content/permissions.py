from rest_framework.permissions import BasePermission


class IsInstructor(BasePermission):
    """Permission check for instructor role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "instructor"
        )


class IsOwner(BasePermission):
    """Permission check for course ownership."""

    def has_object_permission(self, request, view, obj):
        return obj.instructor == request.user
