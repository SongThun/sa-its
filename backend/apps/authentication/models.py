from django.contrib.auth.models import AbstractUser, UserManager as BaseUserManager
from django.db import models
from django.db.models import Q


class UserQuerySet(models.QuerySet):
    """Custom QuerySet for User model with chainable query methods."""

    def active(self):
        """Filter only active users."""
        return self.filter(is_active=True)

    def search(self, query: str):
        """Search users by username, email, or fullname."""
        if not query:
            return self.none()
        return self.filter(
            Q(username__icontains=query)
            | Q(email__icontains=query)
            | Q(fullname__icontains=query)
        )

    def by_email(self, email: str):
        """Filter by normalized email."""
        return self.filter(email=email.strip().lower())


class UserManager(BaseUserManager):
    """
    Custom manager for User model.
    Extends Django's UserManager with additional query methods.
    """

    def get_queryset(self):
        return UserQuerySet(self.model, using=self._db)

    def active(self):
        return self.get_queryset().active()

    def search(self, query: str):
        return self.get_queryset().search(query)

    def by_email(self, email: str):
        return self.get_queryset().by_email(email)

    def email_exists(self, email: str, exclude_pk=None):
        """Check if email exists, optionally excluding a user."""
        qs = self.by_email(email)
        if exclude_pk:
            qs = qs.exclude(pk=exclude_pk)
        return qs.exists()

    def get_by_email(self, email: str):
        """Get user by email or None."""
        try:
            return self.by_email(email).get()
        except self.model.DoesNotExist:
            return None


class User(AbstractUser):
    """Custom User model for the ITS platform."""

    objects = UserManager()
    email = models.EmailField(unique=True, blank=False)
    fullname = models.CharField(max_length=255, blank=True)
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
