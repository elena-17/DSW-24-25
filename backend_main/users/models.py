from account.models import Account
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models

USER_ROLES = (
    ("user", "NormalUser"),
    ("seller", "Vendor"),
    ("admin", "Admin"),
)


class CustomUserManager(BaseUserManager):
    def create_user(self, id_number, email, phone, password=None, **extra_fields):
        if not email:
            raise ValueError("ERROR. Email is required")
        email = self.normalize_email(email)
        user = self.model(id_number=id_number, email=email, phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        # Automatically create an associated account for the user
        Account.objects.create(user=user)

        return user

    def create_superuser(self, id_number, email, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")
        extra_fields.setdefault("is_confirmed", True)
        return self.create_user(id_number, email, phone, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id_number = models.CharField(max_length=20, primary_key=True, unique=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, unique=True)
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=10, choices=USER_ROLES)
    is_active = models.BooleanField(default=True)  # django default
    is_staff = models.BooleanField(default=False)  # django default
    is_confirmed = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["id_number", "phone"]

    def __str__(self):
        return self.email
