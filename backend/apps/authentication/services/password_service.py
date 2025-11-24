"""
Password Service - handles password-related operations.
Single Responsibility: Only manages password changes and validation.
"""

from typing import Optional
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from ..models import User
from .base import ServiceResult


class PasswordService:
    """
    Service for password operations.
    Encapsulates password change and validation logic.
    """

    def change_password(
        self,
        user: User,
        old_password: str,
        new_password: str,
        new_password_confirm: str,
    ) -> ServiceResult[User]:
        """
        Change user's password.

        Args:
            user: The user changing their password
            old_password: Current password
            new_password: New password
            new_password_confirm: New password confirmation

        Returns:
            ServiceResult containing updated user or errors
        """
        # Verify old password
        if not user.check_password(old_password):
            return ServiceResult.fail(
                code="wrong_password",
                message="Wrong password.",
                field="old_password",
            )

        # Validate password confirmation
        if new_password != new_password_confirm:
            return ServiceResult.fail(
                code="password_mismatch",
                message="Password fields didn't match.",
                field="new_password",
            )

        # Validate new password strength
        password_error = self._validate_password(new_password, user)
        if password_error:
            return ServiceResult.fail(
                code="weak_password",
                message=password_error,
                field="new_password",
            )

        # Set new password
        user.set_password(new_password)
        user.save()

        return ServiceResult.ok(user)

    def _validate_password(
        self, password: str, user: Optional[User] = None
    ) -> Optional[str]:
        """
        Validate password against Django's password validators.

        Args:
            password: Password to validate
            user: Optional user for user-attribute validators

        Returns:
            Error message if validation fails, None otherwise
        """
        try:
            validate_password(password, user=user)
            return None
        except ValidationError as e:
            return " ".join(e.messages)

    def reset_password(
        self, user: User, new_password: str, new_password_confirm: str
    ) -> ServiceResult[User]:
        """
        Reset user's password (admin or password reset flow).

        Args:
            user: The user whose password to reset
            new_password: New password
            new_password_confirm: New password confirmation

        Returns:
            ServiceResult containing updated user or errors
        """
        # Validate password confirmation
        if new_password != new_password_confirm:
            return ServiceResult.fail(
                code="password_mismatch",
                message="Password fields didn't match.",
                field="new_password",
            )

        # Validate new password strength
        password_error = self._validate_password(new_password, user)
        if password_error:
            return ServiceResult.fail(
                code="weak_password",
                message=password_error,
                field="new_password",
            )

        # Set new password
        user.set_password(new_password)
        user.save()

        return ServiceResult.ok(user)
