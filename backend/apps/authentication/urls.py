from django.urls import path
from apps.authentication.apis import (
    LoginView,
    UserRegisterView,
    UserProfileView,
    ResetPasswordView,
)
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

urlpatterns = [
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh-token"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("login/", LoginView.as_view(), name="login"),
    path("register/", UserRegisterView.as_view(), name="register"),
    path("profile/", UserProfileView.as_view(), name="user-profile"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
]
