from rest_framework import serializers
from .models import Hangout, HangoutMemory, HangoutMemoryPhoto
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
            'id', 'title', 'venue_location', 'latitude', 'longitude', 'date_time', 
            'max_group_size', 'description', 'category', 'creator', 
            'participants', 'participant_count', 'is_full',
            'is_ended', 'ended_at', 'auto_end_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'creator', 'created_at', 'updated_at', 'is_ended', 'ended_at']
    
    def get_participant_count(self, obj):
        return obj.participants.count()
    
    def get_is_full(self, obj):
        return obj.participants.count() >= obj.max_group_size


class HangoutCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new hangout"""
    invited_friends = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        write_only=True
    )

    class Meta:
        model = Hangout
        fields = [
            'title', 'venue_location', 'latitude', 'longitude', 'date_time', 
            'max_group_size', 'description', 'category', 'invited_friends'
        ]

    def create(self, validated_data):
        # Remove invited_friends from data before creating Hangout instance
        invited_friends = validated_data.pop('invited_friends', [])
        
        # Create the hangout
        hangout = super().create(validated_data)
        
        # Add invited friends as participants
        if invited_friends:
            from users.models import User
            for friend_id in invited_friends:
                try:
                    friend = User.objects.get(id=friend_id)
                    hangout.participants.add(friend)
                except User.DoesNotExist:
                    pass
                    
        return hangout


class HangoutMemoryPhotoSerializer(serializers.ModelSerializer):
    """Serializer for hangout memory photos"""
    uploaded_by = UserSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = HangoutMemoryPhoto
        fields = ['id', 'image', 'image_url', 'caption', 'uploaded_by', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class HangoutMemorySerializer(serializers.ModelSerializer):
    """Serializer for hangout memories"""
    photos = HangoutMemoryPhotoSerializer(many=True, read_only=True)
    photo_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = HangoutMemory
        fields = ['id', 'hangout', 'photos', 'photo_count', 'created_at']
        read_only_fields = ['id', 'hangout', 'created_at']
