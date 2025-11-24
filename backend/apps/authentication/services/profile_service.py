"""
Profile Service - handles user profile operations.
Single Responsibility: Only manages profile viewing and updates.
"""

from typing import Dict, Any, List

from ..models import User
from .base import ServiceResult


class ProfileService:
    """
    Service for user profile operations.
    Encapsulates profile retrieval and update logic.
    """

    # Fields that can be updated by users
    EDITABLE_FIELDS = {"fullname", "first_name", "last_name"}

    # Fields that are read-only
    READ_ONLY_FIELDS = {"id", "username", "email", "created_at", "updated_at"}

    def get_profile(self, user: User) -> ServiceResult[User]:
        """
        Get user's profile.

        Args:
            user: The user whose profile to retrieve

        Returns:
            ServiceResult containing the user
        """
        return ServiceResult.ok(user)

    def update_profile(self, user: User, data: Dict[str, Any]) -> ServiceResult[User]:
        """
        Update user's profile.

        Args:
            user: The user to update
            data: Dictionary of fields to update

        Returns:
            ServiceResult containing updated user or errors
        """
        # Filter out read-only fields
        update_data = {
            key: value for key, value in data.items() if key in self.EDITABLE_FIELDS
        }

        # Update user fields
        for field, value in update_data.items():
            setattr(user, field, value)

        user.save()
        return ServiceResult.ok(user)

    def get_user_by_id(self, user_id: int) -> ServiceResult[User]:
        """
        Get a user by their ID.

        Args:
            user_id: The user's ID

        Returns:
            ServiceResult containing the user or error if not found
        """
        try:
            user = User.objects.get(pk=user_id)
            return ServiceResult.ok(user)
        except User.DoesNotExist:
            return ServiceResult.fail(
                code="user_not_found",
                message="User not found.",
                field="detail",
            )

    def search_users(
        self, query: str, limit: int = 10, offset: int = 0
    ) -> ServiceResult[List[User]]:
        """
        Search for users.

        Args:
            query: Search query string
            limit: Maximum results to return
            offset: Number of results to skip

        Returns:
            ServiceResult containing list of matching users
        """
        users = list(User.objects.search(query).active()[offset : offset + limit])
        return ServiceResult.ok(users)

    def deactivate_user(self, user: User) -> ServiceResult[User]:
        """
        Deactivate a user account.

        Args:
            user: The user to deactivate

        Returns:
            ServiceResult containing the deactivated user
        """
        user.is_active = False
        user.save()
        return ServiceResult.ok(user)

    def activate_user(self, user: User) -> ServiceResult[User]:
        """
        Activate a user account.

        Args:
            user: The user to activate

        Returns:
            ServiceResult containing the activated user
        """
        user.is_active = True
        user.save()
        return ServiceResult.ok(user)
