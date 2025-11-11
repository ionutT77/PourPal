from django.db import models
from django.conf import settings

class Hangout(models.Model):
    """
    Model for social hangout events.
    """
    title = models.CharField(max_length=200)
    venue_location = models.CharField(max_length=300)
    date_time = models.DateTimeField()
    max_group_size = models.IntegerField(default=5)
    description = models.TextField()
    
    # Use settings.AUTH_USER_MODEL instead of 'auth.User'
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_hangouts'
    )
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='joined_hangouts',
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

    class Meta:
        ordering = ['date_time']