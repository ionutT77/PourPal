from django.contrib import admin
from .models import Hangout


@admin.register(Hangout)
class HangoutAdmin(admin.ModelAdmin):
    list_display = ['title', 'venue_location', 'date_time', 'creator', 'max_group_size', 'participant_count', 'created_at']
    list_filter = ['date_time', 'created_at']
    search_fields = ['title', 'venue_location', 'description', 'creator__email']
    ordering = ['-date_time']
    filter_horizontal = ['participants']
    
    def participant_count(self, obj):
        return obj.participants.count()
    participant_count.short_description = 'Participants'
