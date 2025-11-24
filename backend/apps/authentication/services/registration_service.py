"""
Registration Service - handles user registration business logic.
Single Responsibility: Only manages user registration operations.
"""

from typing import Optional
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from ..models import User
from .base import ServiceResult


class RegistrationService:
    """
    Service for user registration operations.
    Encapsulates all registration-related business logic.
    """

    def register(
        self,
        email: str,
        username: str,
        password: str,
        password_confirm: str,
        fullname: str = "",
    ) -> ServiceResult[User]:
        """
        Register a new user.

        Args:
            email: User's email address
            username: Desired username
            password: Password
            password_confirm: Password confirmation
            fullname: Optional full name

        Returns:
            ServiceResult containing the created User or errors
        """
        # Validate password confirmation
        if password != password_confirm:
            return ServiceResult.fail(
                code="password_mismatch",
                message="Password fields didn't match.",
                field="password",
            )

        # Validate password strength
        password_error = self._validate_password(password)
        if password_error:
            return ServiceResult.fail(
                code="weak_password",
                message=password_error,
                field="password",
            )

        # Normalize and validate email
        normalized_email = email.strip().lower()
        if User.objects.email_exists(normalized_email):
            return ServiceResult.fail(
                code="email_exists",
                message="A user with this email already exists.",
                field="email",
            )

        # Check username uniqueness
        if User.objects.filter(username=username).exists():
            return ServiceResult.fail(
                code="username_exists",
                message="A user with this username already exists.",
                field="username",
            )

        # Create user
        user = User.objects.create_user(
            email=normalized_email,
            username=username,
            password=password,
            fullname=fullname,
        )

        return ServiceResult.ok(user)

    def _validate_password(self, password: str) -> Optional[str]:
        """
        Validate password against Django's password validators.

        Returns:
            Error message if validation fails, None otherwise
        """
        try:
            validate_password(password)
            return None
        except ValidationError as e:
            return " ".join(e.messages)
