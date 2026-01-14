from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
import json
from .models import Chat
from hangouts.models import Hangout

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.hangout_id = self.scope['url_route']['kwargs']['hangout_id']
            self.room_group_name = f'chat_{self.hangout_id}'
            
            # Get user from scope (authenticated via AuthMiddlewareStack)
            self.user = self.scope.get('user')
            
            print(f"WebSocket connection attempt - User: {self.user}, Authenticated: {getattr(self.user, 'is_authenticated', False)}")
            
            # Check if user is authenticated
            if not self.user or not self.user.is_authenticated:
                print(f"WebSocket rejected - User not authenticated")
                await self.close(code=4001)
                return
            
            # Check if user is a participant
            is_participant = await self.check_participant()
            if not is_participant:
                print(f"WebSocket rejected - User {self.user.id} not a participant of hangout {self.hangout_id}")
                await self.close(code=4003)
                return

            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            print(f"WebSocket connected - User {self.user.id} joined hangout {self.hangout_id}")
            await self.accept()
        except Exception as e:
            print(f"WebSocket connection error: {str(e)}")
            import traceback
            traceback.print_exc()
            await self.close(code=4000)

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message', '')
        
        if not message.strip():
            return

        # Save message to database
        chat_message = await self.save_message(message)
        
        # Get user info
        user_info = await self.get_user_info()

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'user_id': self.user.id,
                'user_name': user_info['first_name'],
                'user_photo': user_info['photo_url'],
                'timestamp': chat_message.timestamp.isoformat(),
            }
        )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'user_id': event['user_id'],
            'user_name': event['user_name'],
            'user_photo': event['user_photo'],
            'timestamp': event['timestamp'],
        }))

    @database_sync_to_async
    def check_participant(self):
        """Check if user is a participant of the hangout"""
        try:
            hangout = Hangout.objects.get(id=self.hangout_id)
            return hangout.participants.filter(id=self.user.id).exists()
        except Hangout.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, message_text):
        """Save chat message to database"""
        hangout = Hangout.objects.get(id=self.hangout_id)
        chat_message = Chat.objects.create(
            hangout=hangout,
            user=self.user,
            message_text=message_text
        )
        return chat_message

    @database_sync_to_async
    def get_user_info(self):
        """Get user profile information"""
        try:
            profile = self.user.profile
            photos = profile.photos.all()
            photo_url = photos[0].image.url if photos.exists() else None
            return {
                'first_name': self.user.first_name or self.user.email.split('@')[0],
                'photo_url': photo_url,
            }
        except:
            return {
                'first_name': self.user.first_name or self.user.email.split('@')[0],
                'photo_url': None,
            }