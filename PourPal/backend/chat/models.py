from django.db import models
from django.conf import settings
from hangouts.models import Hangout

class Chat(models.Model):
    """
    Model for chat messages within a hangout.
    """
    hangout = models.ForeignKey(
        Hangout,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    # Use settings.AUTH_USER_MODEL instead of 'auth.User'
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_messages'
    )
    message_text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.user.first_name}: {self.message_text[:50]}"