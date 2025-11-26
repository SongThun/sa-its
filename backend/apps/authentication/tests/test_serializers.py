"""
Tests for authentication serializers.
Tests data validation and transformation only - no business logic.
"""

import pytest
from django.contrib.auth import get_user_model
from apps.authentication.serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
    ResetPasswordSerializer,
    UserLoginSerializer,
)

User = get_user_model()


@pytest.mark.django_db
class TestUserSerializer:
    """Tests for UserSerializer"""

    def test_serializer_fields(self):
        """Serializer contains expected fields"""
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="pass123",
            fullname="Test User",
        )
        serializer = UserSerializer(user)

        assert set(serializer.data.keys()) == {
            "id",
            "username",
            "email",
            "fullname",
            "created_at",
        }

    def test_serializer_does_not_expose_sensitive_data(self):
        """Password and admin fields are not exposed"""
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="pass123",
        )
        serializer = UserSerializer(user)

        assert "password" not in serializer.data
        assert "is_staff" not in serializer.data
        assert "is_superuser" not in serializer.data


@pytest.mark.django_db
class TestUserRegistrationSerializer:
    """Tests for UserRegistrationSerializer"""

    def test_valid_registration_data(self):
        """Serializer validates correct registration data"""
        data = {
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "fullname": "New User",
        }
        serializer = UserRegistrationSerializer(data=data)

        assert serializer.is_valid()
        assert serializer.validated_data["email"] == "newuser@example.com"
        assert serializer.validated_data["username"] == "newuser"
        assert serializer.validated_data["fullname"] == "New User"

    def test_password_mismatch(self):
        """Validation fails when passwords don't match"""
        data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "Password123!",
            "password_confirm": "DifferentPass123!",
            "fullname": "Test User",
        }
        serializer = UserRegistrationSerializer(data=data)

        assert not serializer.is_valid()
        assert "password_confirm" in serializer.errors

    def test_email_normalization(self):
        """Email is normalized (lowercase, trimmed)"""
        data = {
            "email": "  TEST@EXAMPLE.COM  ",
            "username": "testuser",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
        }
        serializer = UserRegistrationSerializer(data=data)

        assert serializer.is_valid()
        assert serializer.validated_data["email"] == "test@example.com"

    def test_weak_password_validation(self):
        """Validation fails for weak passwords"""
        data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "123",
            "password_confirm": "123",
        }
        serializer = UserRegistrationSerializer(data=data)

        assert not serializer.is_valid()
        assert "password" in serializer.errors

    def test_missing_required_fields(self):
        """Validation fails when required fields are missing"""
        data = {"email": "test@example.com"}
        serializer = UserRegistrationSerializer(data=data)

        assert not serializer.is_valid()
        assert "username" in serializer.errors
        assert "password" in serializer.errors


@pytest.mark.django_db
class TestUserProfileSerializer:
    """Tests for UserProfileSerializer"""

    def test_serializer_fields(self):
        """Serializer contains expected fields"""
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="pass123",
            fullname="Test User",
        )
        serializer = UserProfileSerializer(user)

        expected_fields = {
            "id",
            "username",
            "email",
            "fullname",
            "created_at",
            "updated_at",
        }
        assert set(serializer.data.keys()) == expected_fields

    def test_read_only_fields(self):
        """Email and username are read-only"""
        user = User.objects.create_user(
            email="original@example.com",
            username="original",
            password="pass123",
        )

        data = {
            "email": "new@example.com",
            "username": "newusername",
            "fullname": "Updated Name",
        }
        serializer = UserProfileSerializer(user, data=data, partial=True)

        assert serializer.is_valid()
        updated_user = serializer.save()

        assert updated_user.email == "original@example.com"
        assert updated_user.username == "original"
        assert updated_user.fullname == "Updated Name"


@pytest.mark.django_db
class TestResetPasswordSerializer:
    """Tests for ResetPasswordSerializer"""

    def test_valid_password_reset(self):
        """Serializer validates correct password reset data"""
        data = {
            "old_password": "OldPass123!",
            "new_password": "NewSecurePass123!",
            "new_password_confirm": "NewSecurePass123!",
        }
        serializer = ResetPasswordSerializer(data=data)

        assert serializer.is_valid()

    def test_new_password_mismatch(self):
        """Validation fails when new passwords don't match"""
        data = {
            "old_password": "OldPass123!",
            "new_password": "NewPass123!",
            "new_password_confirm": "DifferentPass123!",
        }
        serializer = ResetPasswordSerializer(data=data)

        assert not serializer.is_valid()
        assert "new_password_confirm" in serializer.errors

    def test_weak_new_password(self):
        """Validation fails for weak new password"""
        data = {
            "old_password": "OldPass123!",
            "new_password": "123",
            "new_password_confirm": "123",
        }
        serializer = ResetPasswordSerializer(data=data)

        assert not serializer.is_valid()
        assert "new_password" in serializer.errors

    def test_missing_required_fields(self):
        """Validation fails when required fields are missing"""
        data = {"new_password": "NewPass123!"}
        serializer = ResetPasswordSerializer(data=data)

        assert not serializer.is_valid()
        assert "old_password" in serializer.errors
        assert "new_password_confirm" in serializer.errors


@pytest.mark.django_db
class TestUserLoginSerializer:
    """Tests for UserLoginSerializer"""

    def test_valid_login_data(self):
        """Serializer validates correct login data"""
        data = {"email": "test@example.com", "password": "SecurePass123!"}
        serializer = UserLoginSerializer(data=data)

        assert serializer.is_valid()
        assert serializer.validated_data["email"] == "test@example.com"
        assert serializer.validated_data["password"] == "SecurePass123!"

    def test_missing_email_or_password(self):
        """Validation fails when email or password is missing"""
        data = {"email": "test@example.com"}
        serializer = UserLoginSerializer(data=data)

        assert not serializer.is_valid()
        assert "password" in serializer.errors
