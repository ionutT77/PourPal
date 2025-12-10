from rest_framework import serializers
from .models import Chat
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

