from apps.authentication.models import User
from rest_framework.exceptions import ValidationError
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken


class AuthenticationService:
    @staticmethod
    def register(
        email: str,
        username: str,
        password: str,
        fullname: str = "",
        role: str = "student",
    ) -> User:
        if User.objects.email_exists(email):
            raise ValidationError({"email": "Cannot register with this email"})

        user = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            fullname=fullname,
            role=role,
        )

        return user

    @staticmethod
    def login(email, password):
        user = authenticate(username=email, password=password)
        if not user:
            raise ValidationError({"detail": "Incorrect email or password"})

        return user

    @staticmethod
    def reset_password(
        user: User,
        old_password: str,
        new_password: str,
    ):
        if not user.check_password(old_password):
            raise ValidationError({"old_password": "Incorrect password"})

        user.set_password(new_password)
        user.save()

    @staticmethod
    def generate_token(user: User) -> dict:
        refresh = RefreshToken.for_user(user)
        return {"refresh": str(refresh), "access": str(refresh.access_token)}
