"""
Tests for the service layer.
Tests business logic independently of HTTP layer.
"""

import pytest
from django.contrib.auth import get_user_model

from apps.authentication.services import (
    RegistrationService,
    AuthenticationService,
    ProfileService,
    PasswordService,
)

User = get_user_model()


@pytest.mark.django_db
class TestRegistrationService:
    """Tests for RegistrationService."""

    def setup_method(self):
        self.service = RegistrationService()

    def test_successful_registration(self):
        result = self.service.register(
            email="test@example.com",
            username="testuser",
            password="SecurePass123!",
            password_confirm="SecurePass123!",
            fullname="Test User",
        )

        assert result.success is True
        assert result.data is not None
        assert result.data.email == "test@example.com"
        assert result.data.username == "testuser"
        assert result.data.fullname == "Test User"
        assert result.data.check_password("SecurePass123!")

    def test_registration_email_normalized(self):
        result = self.service.register(
            email="  TEST@EXAMPLE.COM  ",
            username="testuser",
            password="SecurePass123!",
            password_confirm="SecurePass123!",
        )

        assert result.success is True
        assert result.data.email == "test@example.com"

    def test_registration_password_mismatch(self):
        result = self.service.register(
            email="test@example.com",
            username="testuser",
            password="SecurePass123!",
            password_confirm="DifferentPass123!",
        )

        assert result.success is False
        assert len(result.errors) == 1
        assert result.errors[0].field == "password"
        assert "match" in result.errors[0].message.lower()

    def test_registration_weak_password(self):
        result = self.service.register(
            email="test@example.com",
            username="testuser",
            password="123",
            password_confirm="123",
        )

        assert result.success is False
        assert len(result.errors) == 1
        assert result.errors[0].field == "password"

    def test_registration_duplicate_email(self):
        # Create existing user
        User.objects.create_user(
            email="test@example.com",
            username="existinguser",
            password="ExistingPass123!",
        )

        result = self.service.register(
            email="test@example.com",
            username="newuser",
            password="SecurePass123!",
            password_confirm="SecurePass123!",
        )

        assert result.success is False
        assert result.errors[0].field == "email"

    def test_registration_duplicate_username(self):
        User.objects.create_user(
            email="existing@example.com",
            username="testuser",
            password="ExistingPass123!",
        )

        result = self.service.register(
            email="new@example.com",
            username="testuser",
            password="SecurePass123!",
            password_confirm="SecurePass123!",
        )

        assert result.success is False
        assert result.errors[0].field == "username"


@pytest.mark.django_db
class TestAuthenticationService:
    """Tests for AuthenticationService."""

    def setup_method(self):
        self.service = AuthenticationService()

    def test_successful_login(self):
        User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="SecurePass123!",
        )

        result = self.service.login(
            email="test@example.com",
            password="SecurePass123!",
        )

        assert result.success is True
        assert "user" in result.data
        assert "tokens" in result.data
        assert "access" in result.data["tokens"]
        assert "refresh" in result.data["tokens"]

    def test_login_email_case_insensitive(self):
        User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="SecurePass123!",
        )

        result = self.service.login(
            email="TEST@EXAMPLE.COM",
            password="SecurePass123!",
        )

        assert result.success is True

    def test_login_invalid_credentials(self):
        User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="SecurePass123!",
        )

        result = self.service.login(
            email="test@example.com",
            password="WrongPassword",
        )

        assert result.success is False
        assert "detail" in result.error_dict()

    def test_login_nonexistent_user(self):
        result = self.service.login(
            email="nonexistent@example.com",
            password="AnyPassword123!",
        )

        assert result.success is False

    def test_login_disabled_user(self):
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="SecurePass123!",
        )
        user.is_active = False
        user.save()

        result = self.service.login(
            email="test@example.com",
            password="SecurePass123!",
        )

        assert result.success is False
        assert "disabled" in result.errors[0].message.lower()


@pytest.mark.django_db
class TestProfileService:
    """Tests for ProfileService."""

    def setup_method(self):
        self.service = ProfileService()

    def test_get_profile(self):
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="SecurePass123!",
        )

        result = self.service.get_profile(user)

        assert result.success is True
        assert result.data == user

    def test_update_profile(self):
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="SecurePass123!",
        )

        result = self.service.update_profile(
            user=user,
            data={"fullname": "Updated Name", "first_name": "John"},
        )

        assert result.success is True
        assert result.data.fullname == "Updated Name"
        assert result.data.first_name == "John"

    def test_update_profile_ignores_readonly_fields(self):
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="SecurePass123!",
        )
        original_email = user.email

        result = self.service.update_profile(
            user=user,
            data={"email": "new@example.com", "fullname": "New Name"},
        )

        assert result.success is True
        assert result.data.email == original_email
        assert result.data.fullname == "New Name"

    def test_get_user_by_id(self):
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="SecurePass123!",
        )

        result = self.service.get_user_by_id(user.id)

        assert result.success is True
        assert result.data.id == user.id

    def test_get_user_by_id_not_found(self):
        result = self.service.get_user_by_id(99999)

        assert result.success is False
        assert result.errors[0].code == "user_not_found"

    def test_search_users(self):
        User.objects.create_user(
            email="john@example.com",
            username="johndoe",
            password="Pass123!",
            fullname="John Doe",
        )
        User.objects.create_user(
            email="jane@example.com",
            username="janedoe",
            password="Pass123!",
            fullname="Jane Doe",
        )
        User.objects.create_user(
            email="bob@example.com",
            username="bob",
            password="Pass123!",
            fullname="Bob Smith",
        )

        result = self.service.search_users("doe")

        assert result.success is True
        assert len(result.data) == 2

    def test_deactivate_user(self):
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="SecurePass123!",
        )

        result = self.service.deactivate_user(user)

        assert result.success is True
        assert result.data.is_active is False

    def test_activate_user(self):
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="SecurePass123!",
        )
        user.is_active = False
        user.save()

        result = self.service.activate_user(user)

        assert result.success is True
        assert result.data.is_active is True


@pytest.mark.django_db
class TestPasswordService:
    """Tests for PasswordService."""

    def setup_method(self):
        self.service = PasswordService()

    def test_successful_password_change(self):
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="OldPassword123!",
        )

        result = self.service.change_password(
            user=user,
            old_password="OldPassword123!",
            new_password="NewPassword123!",
            new_password_confirm="NewPassword123!",
        )

        assert result.success is True
        user.refresh_from_db()
        assert user.check_password("NewPassword123!")

    def test_password_change_wrong_old_password(self):
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="OldPassword123!",
        )

        result = self.service.change_password(
            user=user,
            old_password="WrongPassword",
            new_password="NewPassword123!",
            new_password_confirm="NewPassword123!",
        )

        assert result.success is False
        assert result.errors[0].field == "old_password"

    def test_password_change_mismatch(self):
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="OldPassword123!",
        )

        result = self.service.change_password(
            user=user,
            old_password="OldPassword123!",
            new_password="NewPassword123!",
            new_password_confirm="DifferentPassword123!",
        )

        assert result.success is False
        assert result.errors[0].field == "new_password"

    def test_password_change_weak_password(self):
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="OldPassword123!",
        )

        result = self.service.change_password(
            user=user,
            old_password="OldPassword123!",
            new_password="123",
            new_password_confirm="123",
        )

        assert result.success is False
        assert result.errors[0].field == "new_password"

    def test_reset_password(self):
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="OldPassword123!",
        )

        result = self.service.reset_password(
            user=user,
            new_password="ResetPassword123!",
            new_password_confirm="ResetPassword123!",
        )

        assert result.success is True
        user.refresh_from_db()
        assert user.check_password("ResetPassword123!")
