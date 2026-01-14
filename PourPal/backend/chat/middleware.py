"""
Custom middleware for WebSocket authentication.
Handles session-based authentication for Django Channels WebSocket connections.
"""
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from urllib.parse import parse_qs

User = get_user_model()


class TokenAuthMiddleware(BaseMiddleware):
    """
    Custom middleware to authenticate WebSocket connections using session cookies.
    This works with Django's session authentication.
    """
    
    async def __call__(self, scope, receive, send):
        # Get session from scope (populated by SessionMiddlewareStack)
        session = scope.get('session', {})
        
        # Get user ID from session
        user_id = session.get('_auth_user_id')
        
        if user_id:
            scope['user'] = await self.get_user(user_id)
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)
    
    @database_sync_to_async
    def get_user(self, user_id):
        """Retrieve user from database"""
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()
