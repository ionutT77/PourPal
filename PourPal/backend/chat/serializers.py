from rest_framework import serializers
from .models import Chat, PrivateMessage
from users.serializers import UserSerializer


class ChatSerializer(serializers.ModelSerializer):
    """Serializer for chat messages with user info"""
    user_name = serializers.SerializerMethodField()
    user_photo = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = Chat
        fields = ['id', 'hangout', 'user_id', 'user_name', 'user_photo', 'message_text', 'timestamp']
        read_only_fields = ['id', 'user_id', 'user_name', 'user_photo', 'timestamp']
    
    def get_user_name(self, obj):
        return obj.user.first_name or obj.user.email.split('@')[0]
    
    def get_user_photo(self, obj):
        try:
            photos = obj.user.profile.photos.all()
            if photos.exists():
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(photos[0].image.url)
                return photos[0].image.url
        except:
            pass
        return None


class PrivateMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.first_name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.first_name', read_only=True)
    
    class Meta:
        model = PrivateMessage
        fields = ['id', 'sender', 'sender_name', 'receiver', 'receiver_name', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']


class ConversationSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    user_name = serializers.CharField()
    last_message = serializers.CharField()
    last_message_time = serializers.DateTimeField()
    unread_count = serializers.IntegerField()
