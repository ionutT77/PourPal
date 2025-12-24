from django.contrib import admin
from django.utils.html import format_html
from .models import User, Profile, ProfilePhoto, AgeVerification, Report, Connection


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


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'reporter_email', 'reported_user_email', 'reason', 'status', 'created_at']
    list_filter = ['status', 'reason', 'created_at']
    search_fields = ['reporter__email', 'reported_user__email', 'description']
    ordering = ['-created_at']
    readonly_fields = ['reporter', 'reported_user', 'created_at', 'reviewed_at']
    
    def reporter_email(self, obj):
        return obj.reporter.email if obj.reporter else 'N/A'
    reporter_email.short_description = 'Reporter'
    reporter_email.admin_order_field = 'reporter__email'
    
    def reported_user_email(self, obj):
        return obj.reported_user.email if obj.reported_user else 'N/A'
    reported_user_email.short_description = 'Reported User'
    reported_user_email.admin_order_field = 'reported_user__email'
    
    fieldsets = (
        ('Report Information', {
            'fields': ('reporter', 'reported_user', 'reason', 'description', 'created_at')
        }),
        ('Review Status', {
            'fields': ('status', 'admin_notes', 'reviewed_by', 'reviewed_at')
        }),
    )
    
    actions = ['mark_under_review', 'mark_resolved', 'mark_dismissed']
    
    def mark_under_review(self, request, queryset):
        for report in queryset:
            report.mark_under_review(request.user)
        self.message_user(request, f"{queryset.count()} report(s) marked as under review.")
    mark_under_review.short_description = "Mark selected reports as under review"
    
    def mark_resolved(self, request, queryset):
        for report in queryset:
            report.resolve(request.user)
        self.message_user(request, f"{queryset.count()} report(s) marked as resolved.")
    mark_resolved.short_description = "Mark selected reports as resolved"
    
    def mark_dismissed(self, request, queryset):
        for report in queryset:
            report.dismiss(request.user)
        self.message_user(request, f"{queryset.count()} report(s) dismissed.")
    mark_dismissed.short_description = "Dismiss selected reports"


@admin.register(Connection)
class ConnectionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_email', 'friend_email', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__email', 'friend__email', 'user__first_name', 'friend__first_name']
    ordering = ['-created_at']
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    
    def friend_email(self, obj):
        return obj.friend.email
    friend_email.short_description = 'Friend'
