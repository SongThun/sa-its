"""
Views for authentication module.
Responsibility: HTTP request/response handling only.
Business logic is delegated to the service layer.

Follows Dependency Inversion Principle - views depend on service abstractions.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView

from .serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer,
    UserSerializer,
    ResetPasswordSerializer,
    UserLoginSerializer,
)
from apps.authentication.services import authentication_service, profile_service


class UserRegisterView(GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authentication_service.register(
            email=serializer.validated_data["email"],
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
            fullname=serializer.validated_data.get("fullname", ""),
            role=serializer.validated_data.get("role", "student"),
        )

        tokens = authentication_service.generate_token(user)

        return Response(
            {
                "tokens": tokens,
                "user": UserSerializer(instance=user).data,
                "message": "User registered successfully",
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserLoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authentication_service.login(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )

        tokens = authentication_service.generate_token(user)

        return Response(
            {
                "tokens": tokens,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        user = profile_service.update_profile(
            user=instance,
            data=serializer.validated_data,
        )

        return Response(
            UserProfileSerializer(user).data,
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(GenericAPIView):
    """
    Change password for authenticated user.
    POST /api/auth/reset-password/
    """

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ResetPasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        authentication_service.reset_password(
            user=request.user,
            old_password=serializer.validated_data["old_password"],
            new_password=serializer.validated_data["new_password"],
        )

        return Response(
            {
                "message": "Password changed successfully. Please login again with new password."
            },
            status=status.HTTP_200_OK,
        )
