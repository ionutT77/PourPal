from rest_framework import serializers
from .models import Chat
from users.serializers import UserSerializer


class ChatSerializer(serializers.ModelSerializer):
    """Serializer for chat messages"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Chat
        fields = ['id', 'hangout', 'user', 'message_text', 'timestamp']
        read_only_fields = ['id', 'user', 'timestamp']


class ChatCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating chat messages"""
    class Meta:
        model = Chat
        fields = ['message_text']
