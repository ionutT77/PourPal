from rest_framework import serializers
from .models import Hangout
from users.serializers import UserSerializer


class HangoutSerializer(serializers.ModelSerializer):
    """Serializer for Hangout list and detail views"""
    creator = UserSerializer(read_only=True)
    participants = UserSerializer(many=True, read_only=True)
    participant_count = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    
    class Meta:
        model = Hangout
        fields = [
            'id', 'title', 'venue_location', 'date_time', 
            'max_group_size', 'description', 'creator', 
            'participants', 'participant_count', 'is_full',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'creator', 'created_at', 'updated_at']
    
    def get_participant_count(self, obj):
        return obj.participants.count()
    
    def get_is_full(self, obj):
        return obj.participants.count() >= obj.max_group_size


class HangoutCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new hangout"""
    class Meta:
        model = Hangout
        fields = [
            'title', 'venue_location', 'date_time', 
            'max_group_size', 'description'
        ]
