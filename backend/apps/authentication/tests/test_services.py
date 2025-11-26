"""
Tests for the authentication service layer.
Tests business logic independently of HTTP layer.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

from apps.authentication.services.authentication_service import AuthenticationService

User = get_user_model()


@pytest.mark.django_db
class TestAuthenticationServiceRegister:
    """Tests for AuthenticationService.register()"""

    def setup_method(self):
        self.service = AuthenticationService()

    def test_successful_registration(self):
        """User can register with valid data"""
        user = self.service.register(
            email="test@example.com",
            username="testuser",
            password="SecurePass123!",
            fullname="Test User",
        )

        assert user.email == "test@example.com"
        assert user.username == "testuser"
        assert user.fullname == "Test User"
        assert user.check_password("SecurePass123!")
        assert user.is_active is True

    def test_registration_with_duplicate_email(self):
        """Registration fails when email already exists"""
        User.objects.create_user(
            email="test@example.com",
            username="existing",
            password="Pass123!",
        )

        with pytest.raises(ValidationError) as exc_info:
            self.service.register(
                email="test@example.com",
                username="newuser",
                password="SecurePass123!",
            )

        assert "email" in exc_info.value.detail

    def test_registration_minimal_data(self):
        """User can register without fullname"""
        user = self.service.register(
            email="test@example.com",
            username="testuser",
            password="SecurePass123!",
        )

        assert user.fullname == ""


@pytest.mark.django_db
class TestAuthenticationServiceLogin:
    """Tests for AuthenticationService.login()"""

    def setup_method(self):
        self.service = AuthenticationService()
        self.test_user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="SecurePass123!",
        )

    def test_successful_login(self):
        """User can login with correct credentials"""
        user = self.service.login(
            email="test@example.com",
            password="SecurePass123!",
        )

        assert user == self.test_user

    def test_login_with_wrong_password(self):
        """Login fails with incorrect password"""
        with pytest.raises(ValidationError) as exc_info:
            self.service.login(
                email="test@example.com",
                password="WrongPassword",
            )

        assert "detail" in exc_info.value.detail
        assert "password" in str(exc_info.value.detail["detail"]).lower()

    def test_login_with_nonexistent_email(self):
        """Login fails when user doesn't exist"""
        with pytest.raises(ValidationError) as exc_info:
            self.service.login(
                email="nonexistent@example.com",
                password="AnyPassword123!",
            )

        assert "detail" in exc_info.value.detail

    def test_login_with_inactive_account(self):
        """Login fails when account is disabled"""
        self.test_user.is_active = False
        self.test_user.save()

        with pytest.raises(ValidationError) as exc_info:
            self.service.login(
                email="test@example.com",
                password="SecurePass123!",
            )

        assert "detail" in exc_info.value.detail
        assert "incorrect" in str(exc_info.value.detail["detail"]).lower()


@pytest.mark.django_db
class TestAuthenticationServiceResetPassword:
    """Tests for AuthenticationService.reset_password()"""

    def setup_method(self):
        self.service = AuthenticationService()
        self.test_user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="OldPassword123!",
        )

    def test_successful_password_reset(self):
        """User can change password with correct old password"""
        self.service.reset_password(
            user=self.test_user,
            old_password="OldPassword123!",
            new_password="NewPassword123!",
        )

        self.test_user.refresh_from_db()
        assert self.test_user.check_password("NewPassword123!")

    def test_reset_password_with_wrong_old_password(self):
        """Password reset fails with incorrect old password"""
        with pytest.raises(ValidationError) as exc_info:
            self.service.reset_password(
                user=self.test_user,
                old_password="WrongPassword",
                new_password="NewPassword123!",
            )

        assert "old_password" in exc_info.value.detail

        # Verify password wasn't changed
        self.test_user.refresh_from_db()
        assert self.test_user.check_password("OldPassword123!")


@pytest.mark.django_db
class TestAuthenticationServiceGenerateToken:
    """Tests for AuthenticationService.generate_token()"""

    def setup_method(self):
        self.service = AuthenticationService()
        self.test_user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="SecurePass123!",
        )

    def test_generate_token(self):
        """Service generates valid JWT tokens"""
        tokens = self.service.generate_token(self.test_user)

        assert "access" in tokens
        assert "refresh" in tokens
        assert isinstance(tokens["access"], str)
        assert isinstance(tokens["refresh"], str)
        assert len(tokens["access"]) > 0
        assert len(tokens["refresh"]) > 0
