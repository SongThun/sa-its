import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()


@pytest.mark.django_db
class TestUserRegisterView:
    def test_successful_registration(self, api_client):
        url = reverse("register")
        data = {
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "fullname": "New User",
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert "user" in response.data
        assert response.data["user"]["email"] == "newuser@example.com"
        assert response.data["user"]["username"] == "newuser"
        assert response.data["user"]["fullname"] == "New User"
        assert "message" in response.data

        user = User.objects.get(email="newuser@example.com")
        assert user.check_password("SecurePass123!")

    def test_registration_with_duplicate_email(self, api_client, create_user):
        url = reverse("register")
        data = {
            "email": "test@example.com",
            "username": "newuser",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data

    def test_registration_password_mismatch(self, api_client):
        url = reverse("register")
        data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "Password123!",
            "password_confirm": "DifferentPass123!",
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "password_confirm" in response.data

    def test_registration_missing_fields(self, api_client):
        url = reverse("register")
        data = {
            "email": "test@example.com",
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "username" in response.data
        assert "password" in response.data

    def test_registration_with_weak_password(self, api_client):
        url = reverse("register")
        data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "123",
            "password_confirm": "123",
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "password" in response.data


@pytest.mark.django_db
class TestLoginView:
    def test_successful_login(self, api_client):
        User.objects.create_user(
            email="test@example.com", username="testuser", password="SecurePass123!"
        )

        url = reverse("login")
        data = {"email": "test@example.com", "password": "SecurePass123!"}

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "user" in response.data
        assert "tokens" in response.data
        assert "access" in response.data["tokens"]
        assert "refresh" in response.data["tokens"]
        assert response.data["user"]["email"] == "test@example.com"

    def test_login_with_uppercase_email(self, api_client):
        User.objects.create_user(
            email="test@example.com", username="testuser", password="SecurePass123!"
        )

        url = reverse("login")
        data = {"email": "TEST@EXAMPLE.COM", "password": "SecurePass123!"}

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_with_invalid_credentials(self, api_client):
        url = reverse("login")
        data = {"email": "test@example.com", "password": "WrongPassword"}

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "detail" in response.data

    def test_login_with_nonexistent_user(self, api_client):
        url = reverse("login")
        data = {"email": "nonexistent@example.com", "password": "Password123!"}

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "detail" in response.data

    def test_login_missing_credentials(self, api_client):
        url = reverse("login")
        data = {"email": "test@example.com"}

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "password" in response.data


@pytest.mark.django_db
class TestUserProfileView:
    def test_get_profile_authenticated(self, authenticated_client):
        url = reverse("user-profile")

        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == "test@example.com"
        assert response.data["username"] == "testuser"
        assert "created_at" in response.data
        assert "updated_at" in response.data

    def test_get_profile_unauthenticated(self, api_client):
        url = reverse("user-profile")

        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_profile(self, authenticated_client):
        url = reverse("user-profile")
        data = {"fullname": "Updated Name", "first_name": "John", "last_name": "Doe"}

        response = authenticated_client.patch(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["fullname"] == "Updated Name"

    def test_cannot_update_email(self, authenticated_client):
        url = reverse("user-profile")
        original_email = authenticated_client.user.email

        data = {"email": "newemail@example.com"}

        response = authenticated_client.patch(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == original_email

    def test_cannot_update_username(self, authenticated_client):
        url = reverse("user-profile")
        original_username = authenticated_client.user.username

        data = {"username": "newusername"}

        response = authenticated_client.patch(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["username"] == original_username


@pytest.mark.django_db
class TestResetPasswordView:
    def test_successful_password_reset(self, api_client):
        user = User.objects.create_user(
            email="passwordtest@example.com",
            username="passwordtest",
            password="OldPassword123!",
        )

        api_client.force_authenticate(user=user)

        url = reverse("reset-password")
        data = {
            "old_password": "OldPassword123!",
            "new_password": "NewSecurePass123!",
            "new_password_confirm": "NewSecurePass123!",
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "message" in response.data
        assert "successfully" in response.data["message"].lower()

        user.refresh_from_db()
        assert user.check_password("NewSecurePass123!")

    def test_password_reset_unauthenticated(self, api_client):
        url = reverse("reset-password")
        data = {
            "old_password": "oldpass",
            "new_password": "NewPass123!",
            "new_password_confirm": "NewPass123!",
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_password_reset_wrong_old_password(self, authenticated_client):
        url = reverse("reset-password")
        data = {
            "old_password": "wrongpassword",
            "new_password": "NewPass123!",
            "new_password_confirm": "NewPass123!",
        }

        response = authenticated_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "old_password" in response.data

    def test_password_reset_passwords_dont_match(self, authenticated_client):
        url = reverse("reset-password")
        data = {
            "old_password": "testpass123",
            "new_password": "NewPass123!",
            "new_password_confirm": "DifferentPass123!",
        }

        response = authenticated_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "new_password_confirm" in response.data

    def test_password_reset_weak_password(self, authenticated_client):
        url = reverse("reset-password")
        data = {
            "old_password": "testpass123",
            "new_password": "123",
            "new_password_confirm": "123",
        }

        response = authenticated_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "new_password" in response.data

    def test_password_reset_missing_fields(self, authenticated_client):
        url = reverse("reset-password")
        data = {"new_password": "NewPass123!"}

        response = authenticated_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert (
            "old_password" in response.data or "new_password_confirm" in response.data
        )
