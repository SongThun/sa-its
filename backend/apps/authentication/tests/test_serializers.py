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
    def test_serializer_fields(self):
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
        user = User.objects.create_user(
            email="test@example.com", username="testuser", password="pass123"
        )
        serializer = UserSerializer(user)

        assert "password" not in serializer.data
        assert "is_staff" not in serializer.data
        assert "is_superuser" not in serializer.data


@pytest.mark.django_db
class TestUserRegistrationSerializer:
    def test_valid_registration_data(self):
        data = {
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "fullname": "New User",
        }
        serializer = UserRegistrationSerializer(data=data)

        assert serializer.is_valid()
        user = serializer.save()
        assert user.email == "newuser@example.com"
        assert user.username == "newuser"
        assert user.fullname == "New User"
        assert user.check_password("SecurePass123!")

    def test_password_mismatch(self):
        data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "Password123!",
            "password_confirm": "DifferentPass123!",
            "fullname": "Test User",
        }
        serializer = UserRegistrationSerializer(data=data)

        assert not serializer.is_valid()
        assert "password" in serializer.errors

    def test_email_normalization(self):
        data = {
            "email": "  TEST@EXAMPLE.COM  ",
            "username": "testuser",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
        }
        serializer = UserRegistrationSerializer(data=data)

        assert serializer.is_valid()
        user = serializer.save()
        assert user.email == "test@example.com"

    def test_duplicate_email_validation(self):
        User.objects.create_user(
            email="existing@example.com", username="existing", password="pass123"
        )

        # Try to register with same email
        data = {
            "email": "existing@example.com",
            "username": "newuser",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
        }
        serializer = UserRegistrationSerializer(data=data)

        assert not serializer.is_valid()
        assert "email" in serializer.errors
        assert "already exists" in str(serializer.errors["email"][0])

    def test_duplicate_email_case_insensitive(self):
        User.objects.create_user(
            email="user@example.com", username="user1", password="pass123"
        )

        data = {
            "email": "USER@EXAMPLE.COM",
            "username": "user2",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
        }
        serializer = UserRegistrationSerializer(data=data)

        assert not serializer.is_valid()
        assert "email" in serializer.errors

    def test_weak_password_validation(self):
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
        data = {
            "email": "test@example.com",
        }
        serializer = UserRegistrationSerializer(data=data)

        assert not serializer.is_valid()
        assert "username" in serializer.errors
        assert "password" in serializer.errors


@pytest.mark.django_db
class TestUserProfileSerializer:
    def test_serializer_fields(self):
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
            "first_name",
            "last_name",
            "created_at",
            "updated_at",
        }
        assert set(serializer.data.keys()) == expected_fields

    def test_read_only_fields(self):
        user = User.objects.create_user(
            email="original@example.com", username="original", password="pass123"
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
    def test_valid_password_reset(self):
        data = {
            "old_password": "OldPass123!",
            "new_password": "NewSecurePass123!",
            "new_password_confirm": "NewSecurePass123!",
        }
        serializer = ResetPasswordSerializer(data=data)

        assert serializer.is_valid()

    def test_new_password_mismatch(self):
        data = {
            "old_password": "OldPass123!",
            "new_password": "NewPass123!",
            "new_password_confirm": "DifferentPass123!",
        }
        serializer = ResetPasswordSerializer(data=data)

        assert not serializer.is_valid()
        assert "new_password" in serializer.errors

    def test_weak_new_password(self):
        data = {
            "old_password": "OldPass123!",
            "new_password": "123",
            "new_password_confirm": "123",
        }
        serializer = ResetPasswordSerializer(data=data)

        assert not serializer.is_valid()
        assert "new_password" in serializer.errors

    def test_missing_required_fields(self):
        data = {"new_password": "NewPass123!"}
        serializer = ResetPasswordSerializer(data=data)

        assert not serializer.is_valid()
        assert "old_password" in serializer.errors
        assert "new_password_confirm" in serializer.errors


@pytest.mark.django_db
class TestUserLoginSerializer:
    def test_successful_login(self):
        User.objects.create_user(
            email="test@example.com", username="testuser", password="SecurePass123!"
        )

        data = {"email": "test@example.com", "password": "SecurePass123!"}
        serializer = UserLoginSerializer(data=data)

        assert serializer.is_valid()
        validated_data = serializer.validated_data

        assert "user" in validated_data
        assert "tokens" in validated_data
        assert "access" in validated_data["tokens"]
        assert "refresh" in validated_data["tokens"]
        assert validated_data["user"]["email"] == "test@example.com"

    def test_email_normalization_on_login(self):
        User.objects.create_user(
            email="test@example.com", username="testuser", password="SecurePass123!"
        )

        data = {"email": "  TEST@EXAMPLE.COM  ", "password": "SecurePass123!"}
        serializer = UserLoginSerializer(data=data)

        assert serializer.is_valid()
        validated_data = serializer.validated_data
        assert validated_data["user"]["email"] == "test@example.com"

    def test_invalid_credentials(self):
        User.objects.create_user(
            email="test@example.com", username="testuser", password="CorrectPass123!"
        )

        data = {"email": "test@example.com", "password": "WrongPassword"}
        serializer = UserLoginSerializer(data=data)

        assert not serializer.is_valid()
        assert "detail" in serializer.errors
        assert "Invalid email or password" in str(serializer.errors["detail"][0])

    def test_nonexistent_user(self):
        data = {"email": "nonexistent@example.com", "password": "SomePass123!"}
        serializer = UserLoginSerializer(data=data)

        assert not serializer.is_valid()
        assert "detail" in serializer.errors

    def test_missing_email_or_password(self):
        data = {"email": "test@example.com"}
        serializer = UserLoginSerializer(data=data)

        assert not serializer.is_valid()
        assert "password" in serializer.errors

    def test_jwt_token_structure(self):
        User.objects.create_user(
            email="test@example.com", username="testuser", password="Pass123!"
        )

        data = {"email": "test@example.com", "password": "Pass123!"}
        serializer = UserLoginSerializer(data=data)

        assert serializer.is_valid()
        validated_data = serializer.validated_data

        assert isinstance(validated_data["tokens"]["access"], str)
        assert isinstance(validated_data["tokens"]["refresh"], str)
        assert len(validated_data["tokens"]["access"]) > 0
        assert len(validated_data["tokens"]["refresh"]) > 0
