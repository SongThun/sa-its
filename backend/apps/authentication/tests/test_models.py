import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    def test_create_user(self):
        user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="testpass123",
            fullname="Test User",
        )

        assert user.email == "test@example.com"
        assert user.username == "testuser"
        assert user.fullname == "Test User"
        assert user.check_password("testpass123")
        assert user.is_active
        assert not user.is_staff
        assert not user.is_superuser

    def test_user_email_unique(self):
        User.objects.create_user(
            email="duplicate@example.com", username="user1", password="pass123"
        )

        with pytest.raises(IntegrityError):
            User.objects.create_user(
                email="duplicate@example.com", username="user2", password="pass123"
            )

    def test_user_str_representation(self):
        user = User.objects.create_user(
            email="test@example.com", username="testuser", password="pass123"
        )

        assert str(user) == "test@example.com"

    def test_user_full_name_property(self):
        user1 = User.objects.create_user(
            email="user1@example.com",
            username="user1",
            password="pass123",
            fullname="John Doe",
        )
        assert user1.full_name == "John Doe"

        user2 = User.objects.create_user(
            email="user2@example.com", username="user2", password="pass123"
        )
        assert user2.full_name == "user2"

    def test_user_username_field_is_email(self):
        assert User.USERNAME_FIELD == "email"

    def test_user_required_fields(self):
        assert "username" in User.REQUIRED_FIELDS
