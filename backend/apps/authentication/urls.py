from django.urls import path
from .views import (
    LoginView,
    UserRegisterView,
    UserProfileView,
    UserDetailView,
    ResetPasswordView,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("register/", UserRegisterView.as_view(), name="register"),
    path("profile/", UserProfileView.as_view(), name="user-profile"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    path("reset-password/", ResetPasswordView.as_view(), name="change-password"),
]
