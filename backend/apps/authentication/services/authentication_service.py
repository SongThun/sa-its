"""
Authentication Service - handles login and token operations.
Single Responsibility: Only manages authentication operations.
"""

from typing import Dict, Any
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import User
from .base import ServiceResult


class AuthenticationService:
    """
    Service for authentication operations.
    Encapsulates login, token generation, and validation logic.
    """

    def login(self, email: str, password: str) -> ServiceResult[Dict[str, Any]]:
        """
        Authenticate user and generate JWT tokens.

        Args:
            email: User's email address
            password: User's password

        Returns:
            ServiceResult containing user data and tokens or errors
        """
        # Normalize email
        normalized_email = email.strip().lower()

        # Authenticate user
        user = authenticate(username=normalized_email, password=password)

        if not user:
            return ServiceResult.fail(
                code="invalid_credentials",
                message="Invalid email or password.",
                field="detail",
            )

        if not user.is_active:
            return ServiceResult.fail(
                code="account_disabled",
                message="User account is disabled.",
                field="detail",
            )

        # Generate tokens
        tokens = self._generate_tokens(user)

        return ServiceResult.ok(
            {
                "user": user,
                "tokens": tokens,
            }
        )

    def _generate_tokens(self, user: User) -> Dict[str, str]:
        """Generate JWT token pair for user."""
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

    def refresh_token(self, refresh_token: str) -> ServiceResult[Dict[str, str]]:
        """
        Refresh access token using refresh token.

        Args:
            refresh_token: Valid refresh token

        Returns:
            ServiceResult containing new token pair or errors
        """
        try:
            refresh = RefreshToken(refresh_token)
            return ServiceResult.ok(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            )
        except Exception:
            return ServiceResult.fail(
                code="invalid_token",
                message="Invalid or expired refresh token.",
                field="detail",
            )

    def verify_token(self, token: str) -> ServiceResult[bool]:
        """
        Verify if a token is valid.

        Args:
            token: Token to verify

        Returns:
            ServiceResult with True if valid, error otherwise
        """
        try:
            from rest_framework_simplejwt.tokens import AccessToken

            AccessToken(token)
            return ServiceResult.ok(True)
        except Exception:
            return ServiceResult.fail(
                code="invalid_token",
                message="Token is invalid or expired.",
                field="detail",
            )
