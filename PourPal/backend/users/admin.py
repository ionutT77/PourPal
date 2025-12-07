from django.contrib import admin
from django.utils.html import format_html
from .models import User, Profile, ProfilePhoto, AgeVerification


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


@admin.register(AgeVerification)
class AgeVerificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'uploaded_at', 'verified_at', 'document_preview']
    list_filter = ['status', 'uploaded_at']
    search_fields = ['user__email', 'user__username']
    ordering = ['-uploaded_at']
    readonly_fields = ['user', 'uploaded_at', 'document_image_preview']
    
    def document_preview(self, obj):
        if obj.document:
            return format_html('<a href="{}" target="_blank">View Document</a>', obj.document.url)
        return "No document"
    document_preview.short_description = "Document"
    
    def document_image_preview(self, obj):
        if obj.document:
            return format_html('<img src="{}" style="max-width: 500px; max-height: 500px;" />', obj.document.url)
        return "No document uploaded"
    document_image_preview.short_description = "Document Preview"
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'uploaded_at')
        }),
        ('Document', {
            'fields': ('document', 'document_image_preview')
        }),
        ('Verification Status', {
            'fields': ('status', 'verified_at', 'verified_by', 'rejection_reason')
        }),
    )
