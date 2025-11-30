from django.contrib.auth.models import (
    AbstractUser,
    UserManager as BaseUserManager,
)
from django.db import models


class UserManager(BaseUserManager):
    def email_exists(self, email: str) -> bool:
        return self.filter(email__iexact=email.lower().strip()).exists()

    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        """Create and save a superuser with the given email and password."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, username, password, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = [
        ("student", "Student"),
        ("instructor", "Instructor"),
        ("admin", "Admin"),
    ]

    objects = UserManager()
    email = models.EmailField(unique=True, blank=False)
    fullname = models.CharField(max_length=255, blank=True)
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="student",
        help_text="User role determines permissions and access level",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Default Django user login uses `username` and `password`
    # change it to `email` and `password`
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-created_at"]

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return self.fullname if self.fullname else self.username

    def is_student(self):
        return self.role == "student"

    def is_instructor(self):
        return self.role == "instructor"

    def is_admin(self):
        return self.role == "admin"
