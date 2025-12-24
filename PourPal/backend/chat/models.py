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

class PrivateMessage(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_private_messages'
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_private_messages'
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['sender', 'receiver', 'created_at']),
            models.Index(fields=['receiver', 'is_read']),
        ]
    
    def __str__(self):
        return f"{self.sender.first_name} -> {self.receiver.first_name}: {self.message[:30]}"
