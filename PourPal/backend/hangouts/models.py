from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

class Hangout(models.Model):
    """
    Model for social hangout events.
    """
    CATEGORY_CHOICES = [
        ('drinks', 'Drinks & Bar'),
        ('food', 'Food & Dining'),
        ('sports', 'Sports & Fitness'),
        ('arts', 'Arts & Culture'),
        ('music', 'Music & Concerts'),
        ('outdoor', 'Outdoor Activities'),
        ('gaming', 'Gaming'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    venue_location = models.CharField(max_length=300)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    date_time = models.DateTimeField()
    max_group_size = models.IntegerField(default=5)
    description = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='other'
    )
    
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
    kicked_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='kicked_from_hangouts',
        blank=True
    )
    
    # Hangout status
    is_ended = models.BooleanField(default=False)
    ended_at = models.DateTimeField(null=True, blank=True)
    auto_end_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Set auto_end_date to 3 days after creation if not set
        if not self.auto_end_date and not self.pk:
            self.auto_end_date = timezone.now() + timedelta(days=3)
        super().save(*args, **kwargs)
    
    def end_hangout(self):
        """Manually end the hangout"""
        self.is_ended = True
        self.ended_at = timezone.now()
        self.save()
    
    @property
    def should_auto_end(self):
        """Check if hangout should be automatically ended"""
        if self.auto_end_date and timezone.now() >= self.auto_end_date:
            return True
        return False

    class Meta:
        ordering = ['date_time']


class HangoutMemory(models.Model):
    """
    Memories from completed hangouts.
    Stores photos and notes from participants.
    """
    hangout = models.OneToOneField(Hangout, on_delete=models.CASCADE, related_name='memory')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Memory: {self.hangout.title}"
    
    @property
    def photo_count(self):
        """Return the number of memory photos"""
        return self.photos.count()


class HangoutMemoryPhoto(models.Model):
    """
    Photos from hangout memories - max 3 photos per hangout.
    """
    memory = models.ForeignKey(HangoutMemory, on_delete=models.CASCADE, related_name='photos')
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='uploaded_memory_photos'
    )
    image = models.ImageField(upload_to='hangout_memories/')
    caption = models.CharField(max_length=200, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"Memory photo for {self.memory.hangout.title}"