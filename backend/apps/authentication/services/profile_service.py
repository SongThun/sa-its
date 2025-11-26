"""
Profile Service - handles user profile operations.
Single Responsibility: Only manages profile viewing and updates.
"""

from typing import Dict, Any

from apps.authentication.models import User


class ProfileService:
    EDITABLE_FIELDS = {"username", "fullname"}
    READ_ONLY_FIELDS = {"id", "email", "created_at", "updated_at"}

    def update_profile(self, user: User, data: Dict[str, Any]) -> User:
        update_data = {
            key: value for key, value in data.items() if key in self.EDITABLE_FIELDS
        }

        for field, value in update_data.items():
            setattr(user, field, value)

        user.save()

        return user

    def deactivate_user(self, user: User):
        user.is_active = False
        user.save()

    def activate_user(self, user: User):
        """
        Activate a user account.

        Args:
            user: The user to activate

        Returns:
            ServiceResult containing the activated user
        """
        user.is_active = True
        user.save()
