"""
Views for authentication module.
Responsibility: HTTP request/response handling only.
Business logic is delegated to the service layer.

Follows Dependency Inversion Principle - views depend on service abstractions.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer,
    UserSerializer,
    ResetPasswordSerializer,
    UserLoginSerializer,
)
from .services import (
    RegistrationService,
    AuthenticationService,
    ProfileService,
    PasswordService,
)


class UserRegisterView(APIView):
    """
    User registration endpoint.
    POST /api/auth/register/
    """

    permission_classes = [permissions.AllowAny]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.registration_service = RegistrationService()

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        result = self.registration_service.register(
            email=serializer.validated_data["email"],
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
            password_confirm=serializer.validated_data["password_confirm"],
            fullname=serializer.validated_data.get("fullname", ""),
        )

        if not result.success:
            return Response(result.error_dict(), status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "user": UserSerializer(result.data).data,
                "message": "User registered successfully",
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    Custom login endpoint that returns user data along with JWT tokens.
    POST /api/auth/login/
    """

    permission_classes = [permissions.AllowAny]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.auth_service = AuthenticationService()

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        result = self.auth_service.login(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )

        if not result.success:
            return Response(result.error_dict(), status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "user": UserSerializer(result.data["user"]).data,
                "tokens": result.data["tokens"],
            },
            status=status.HTTP_200_OK,
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get/Update current user profile.
    GET/PUT/PATCH /api/auth/profile/
    """

    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.profile_service = ProfileService()

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        serializer = self.get_serializer(data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        result = self.profile_service.update_profile(
            user=self.request.user,
            data=serializer.validated_data,
        )

        if not result.success:
            return Response(result.error_dict(), status=status.HTTP_400_BAD_REQUEST)

        return Response(
            UserProfileSerializer(result.data).data,
            status=status.HTTP_200_OK,
        )


class UserDetailView(APIView):
    """
    Get user details by ID (public).
    GET /api/auth/users/{id}/
    """

    permission_classes = [permissions.IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.profile_service = ProfileService()

    def get(self, request, pk):
        result = self.profile_service.get_user_by_id(pk)

        if not result.success:
            return Response(result.error_dict(), status=status.HTTP_404_NOT_FOUND)

        return Response(
            UserSerializer(result.data).data,
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(APIView):
    """
    Change password for authenticated user.
    POST /api/auth/reset-password/
    """

    permission_classes = [permissions.IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.password_service = PasswordService()

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        result = self.password_service.change_password(
            user=request.user,
            old_password=serializer.validated_data["old_password"],
            new_password=serializer.validated_data["new_password"],
            new_password_confirm=serializer.validated_data["new_password_confirm"],
        )

        if not result.success:
            return Response(result.error_dict(), status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "message": "Password changed successfully. Please login again with new password."
            },
            status=status.HTTP_200_OK,
        )
