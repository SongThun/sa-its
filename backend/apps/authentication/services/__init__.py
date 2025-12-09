from .authentication_service import AuthenticationService
from .profile_service import ProfileService

# Singleton instances
authentication_service = AuthenticationService()
profile_service = ProfileService()

__all__ = [
    "AuthenticationService",
    "ProfileService",
    "authentication_service",
    "profile_service",
]
