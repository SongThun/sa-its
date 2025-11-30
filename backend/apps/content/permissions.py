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
    """Permission check for object ownership."""

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "instructor"):
            return obj.instructor == request.user

        if hasattr(obj, "course"):
            return obj.course.instructor == request.user

        if hasattr(obj, "module"):
            return obj.module.course.instructor == request.user

        return False
