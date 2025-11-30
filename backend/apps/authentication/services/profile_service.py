"""
Profile Service - handles user profile operations.
Single Responsibility: Only manages profile viewing and updates.
"""

from typing import Dict, Any

from apps.authentication.models import User


class ProfileService:
    EDITABLE_FIELDS = {"username", "fullname"}
    READ_ONLY_FIELDS = {"id", "email", "created_at", "updated_at"}

    @staticmethod
    def update_profile(user: User, data: Dict[str, Any]) -> User:
        update_data = {
            key: value
            for key, value in data.items()
            if key in ProfileService.EDITABLE_FIELDS
        }

        for field, value in update_data.items():
            setattr(user, field, value)

        user.save()

        return user

    @staticmethod
    def deactivate_user(user: User):
        user.is_active = False
        user.save()

    @staticmethod
    def activate_user(user: User):
        user.is_active = True
        user.save()
