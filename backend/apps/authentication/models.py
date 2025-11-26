from django.contrib.auth.models import AbstractUser, UserManager as BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def email_exists(self, email: str) -> bool:
        return self.filter(email__iexact=email.lower().strip()).exists()


class User(AbstractUser):
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
