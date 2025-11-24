"""
Serializers for authentication module.
Responsibility: Data validation and transformation only.
Business logic is handled by the service layer.
"""

from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model (public view).
    Used for returning user data in responses.
    """

    class Meta:
        model = User
        fields = ["id", "username", "email", "fullname", "created_at"]
        read_only_fields = ["id", "created_at"]


class UserRegistrationSerializer(serializers.Serializer):
    """
    Serializer for user registration input validation.
    Only validates input format - business logic in RegistrationService.
    """

    username = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)
    fullname = serializers.CharField(max_length=255, required=False, default="")


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile (includes private info).
    Used for profile retrieval and updates.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "fullname",
            "first_name",
            "last_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "username", "email", "created_at", "updated_at"]


class ResetPasswordSerializer(serializers.Serializer):
    """
    Serializer for password change input validation.
    Only validates input format - business logic in PasswordService.
    """

    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    new_password_confirm = serializers.CharField(required=True, write_only=True)


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for login input validation.
    Only validates input format - business logic in AuthenticationService.
    """

    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class LoginResponseSerializer(serializers.Serializer):
    """Serializer for login response data."""

    user = UserSerializer()
    tokens = serializers.DictField()
