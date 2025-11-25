from django.contrib import admin
from .models import User, Profile, ProfilePhoto


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'first_name', 'is_18_plus', 'is_active', 'date_joined']
    list_filter = ['is_18_plus', 'is_active', 'is_staff']
    search_fields = ['email', 'username', 'first_name']
    ordering = ['-date_joined']


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'age', 'bio']
    search_fields = ['user__email', 'user__username', 'bio']


@admin.register(ProfilePhoto)
class ProfilePhotoAdmin(admin.ModelAdmin):
    list_display = ['profile', 'is_primary', 'order', 'uploaded_at']
    list_filter = ['is_primary']
    ordering = ['profile', 'order']
