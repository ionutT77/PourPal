from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Users must be 18+ and register with email.
    """
    email = models.EmailField(unique=True)
    is_18_plus = models.BooleanField(default=False)
    
    # Fix the clash by adding related_name
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        related_name='custom_user_set',
        related_query_name='custom_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        related_name='custom_user_set',
        related_query_name='custom_user',
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name']
    
    def __str__(self):
        return self.email


class Profile(models.Model):
    """
    User profile with additional information.
    One-to-one relationship with User.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True, help_text="My Vibe")
    
    def __str__(self):
        return f"{self.user.first_name}'s Profile"