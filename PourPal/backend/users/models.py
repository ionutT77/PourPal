from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Users must be 18+ and register with email.
    """
    email = models.EmailField(unique=True)
    is_18_plus = models.BooleanField(default=False)
    
    # Fix the clash by adding related_name
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        related_name='custom_user_set',
        related_query_name='custom_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        related_name='custom_user_set',
        related_query_name='custom_user',
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name']
    
    def __str__(self):
        return self.email


# Predefined hobbies list
PREDEFINED_HOBBIES = [
    'Reading', 'Gaming', 'Cooking', 'Traveling', 'Photography',
    'Music', 'Sports', 'Hiking', 'Yoga', 'Dancing',
    'Painting', 'Writing', 'Gardening', 'Cycling', 'Swimming',
    'Movies', 'Theater', 'Crafts', 'Fitness', 'Meditation',
    'Board Games', 'Volunteering', 'Collecting', 'Fishing', 'Camping'
]


class Profile(models.Model):
    """
    User profile with comprehensive information.
    One-to-one relationship with User.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Basic Info
    bio = models.TextField(max_length=500, blank=True, help_text="Tell us about yourself")
    age = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(18), MaxValueValidator(120)]
    )
    
    # Interests & Hobbies (stored as JSON arrays)
    interests = models.JSONField(default=list, blank=True, help_text="Your interests")
    hobbies = models.JSONField(
        default=list, 
        blank=True, 
        help_text="Select up to 3 hobbies"
    )
    
    # Favorites
    favorite_drinks = models.JSONField(default=list, blank=True, help_text="Your favorite drinks")
    favorite_food = models.TextField(max_length=200, blank=True, help_text="Your favorite food")
    
    # Social Media (all optional)
    instagram = models.URLField(max_length=200, blank=True, null=True)
    twitter = models.URLField(max_length=200, blank=True, null=True)
    facebook = models.URLField(max_length=200, blank=True, null=True)
    linkedin = models.URLField(max_length=200, blank=True, null=True)
    snapchat = models.CharField(max_length=100, blank=True, null=True, help_text="Snapchat username")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.first_name}'s Profile"
    
    @property
    def photo_count(self):
        """Return the number of photos"""
        return self.photos.count()
    
    @property
    def primary_photo(self):
        """Return the primary photo or the first photo"""
        try:
            # Try to get the primary photo
            primary = self.photos.filter(is_primary=True).first()
            if primary:
                return primary
            # If no primary, return the first photo
            return self.photos.order_by('order').first()
        except Exception:
            return None
    
    @property
    def completion_percentage(self):
        """Calculate profile completion percentage"""
        total_points = 100
        earned_points = 0
        
        # Photos (25 points)
        if self.photos.count() > 0:
            earned_points += 25
        
        # Age (10 points)
        if self.age:
            earned_points += 10
        
        # Bio (15 points)
        if self.bio:
            earned_points += 15
        
        # Hobbies (15 points)
        if len(self.hobbies) > 0:
            earned_points += 15
        
        # Interests (15 points)
        if len(self.interests) > 0:
            earned_points += 15
        
        # Favorite drinks (10 points)
        if len(self.favorite_drinks) > 0:
            earned_points += 10
        
        # Favorite food (10 points)
        if self.favorite_food:
            earned_points += 10
        
        return earned_points
    
    @property
    def is_age_verified(self):
        """Check if user has verified age"""
        try:
            return self.user.age_verification.is_verified
        except:
            return False



class ProfilePhoto(models.Model):
    """
    Profile photos - users can upload up to 4 photos.
    """
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='profile_photos/')
    is_primary = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', '-uploaded_at']
        
    def __str__(self):
        return f"Photo {self.order} for {self.profile.user.first_name}"
    
    def save(self, *args, **kwargs):
        # Ensure only one primary photo
        if self.is_primary:
            ProfilePhoto.objects.filter(
                profile=self.profile, 
                is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        
        # If this is the first photo, make it primary
        if not self.pk and self.profile.photos.count() == 0:
            self.is_primary = True
        
        super().save(*args, **kwargs)


class AgeVerification(models.Model):
    """
    Age verification through document upload.
    Users upload ID document for admin review.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='age_verification'
    )
    document = models.ImageField(
        upload_to='age_verification/',
        help_text="Upload a photo of your ID (government-issued document)"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='verified_users'
    )
    rejection_reason = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Age Verification"
        verbose_name_plural = "Age Verifications"
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.status}"
    
    @property
    def is_verified(self):
        """Quick check if verification is approved"""
        return self.status == 'approved'