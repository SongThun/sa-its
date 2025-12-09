from rest_framework.permissions import BasePermission


class IsInstructor(BasePermission):
    """Check if user is an instructor."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "instructor"
        )


class IsOwner(BasePermission):
    """Check if user owns the object (for update/delete operations)."""

    def has_object_permission(self, request, view, obj):
        return obj.get_instructor() == request.user
