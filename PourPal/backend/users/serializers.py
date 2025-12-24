import re
from rest_framework import serializers
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User, Profile, ProfilePhoto, AgeVerification, Report, PREDEFINED_HOBBIES


class ProfilePhotoSerializer(serializers.ModelSerializer):
    """Serializer for profile photos"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProfilePhoto
        fields = ['id', 'image', 'image_url', 'is_primary', 'order', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with all fields"""
    photos = ProfilePhotoSerializer(many=True, read_only=True)
    photo_count = serializers.ReadOnlyField()
    completion_percentage = serializers.ReadOnlyField()
    is_age_verified = serializers.ReadOnlyField()
    primary_photo_url = serializers.SerializerMethodField()
    predefined_hobbies = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = [
            'id', 'bio', 'age', 'interests', 'hobbies', 
            'favorite_drinks', 'favorite_food',
            'instagram', 'twitter', 'facebook', 'linkedin', 'snapchat',
            'photos', 'photo_count', 'completion_percentage', 'is_age_verified', 'primary_photo_url', 'predefined_hobbies',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_primary_photo_url(self, obj):
        primary = obj.primary_photo
        if primary and primary.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary.image.url)
            return primary.image.url
        return None
    
    def get_predefined_hobbies(self, obj):
        """Return list of predefined hobbies for selection"""
        return PREDEFINED_HOBBIES
    
    def validate_hobbies(self, value):
        """Validate that user selects max 3 hobbies"""
        if len(value) > 3:
            raise serializers.ValidationError("You can select a maximum of 3 hobbies.")
        return value
    
    def validate_age(self, value):
        """Validate age is 18+"""
        if value and value < 18:
            raise serializers.ValidationError("You must be at least 18 years old.")
        return value


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details"""
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'is_18_plus', 'profile']
        read_only_fields = ['id']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration with password and email validation"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'password', 'password_confirm', 'is_18_plus']
    
    def validate_email(self, value):
        """Validate email format"""
        try:
            validate_email(value)
        except DjangoValidationError:
            raise serializers.ValidationError("Enter a valid email address.")
        
        # Check if email already exists
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        
        return value
    
    def validate_password(self, value):
        """
        Validate password strength:
        - At least 1 uppercase letter
        - At least 1 number
        - At least 1 special character
        """
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError(
                "Password must contain at least one uppercase letter."
            )
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError(
                "Password must contain at least one number."
            )
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;~`]', value):
            raise serializers.ValidationError(
                "Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>_-+=[]\\\/;~`)."
            )
        
        return value
    
    def validate(self, data):
        """Validate password confirmation and age requirement"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords don't match."})
        if not data.get('is_18_plus'):
            raise serializers.ValidationError({"is_18_plus": "You must be 18+ to register."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create associated profile
        Profile.objects.create(user=user)
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class AgeVerificationSerializer(serializers.ModelSerializer):
    """Serializer for age verification"""
    document_url = serializers.SerializerMethodField()
    
    class Meta:
        model = AgeVerification
        fields = ['id', 'document', 'document_url', 'status', 'uploaded_at', 'verified_at', 'rejection_reason']
        read_only_fields = ['id', 'status', 'verified_at', 'rejection_reason', 'uploaded_at']
    
    def get_document_url(self, obj):
        if obj.document:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.document.url)
            return obj.document.url
        return None


class ReportSerializer(serializers.ModelSerializer):
    """Serializer for creating reports"""
    reporter_name = serializers.SerializerMethodField(read_only=True)
    reported_user_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'reporter', 'reported_user', 'reason', 'description',
            'status', 'created_at', 'reporter_name', 'reported_user_name'
        ]
        read_only_fields = ['id', 'reporter', 'status', 'created_at']
    
    def get_reporter_name(self, obj):
        return obj.reporter.first_name if obj.reporter else None
    
    def get_reported_user_name(self, obj):
        return obj.reported_user.first_name if obj.reported_user else None
    
    def validate(self, data):
        """Prevent users from reporting themselves"""
        request = self.context.get('request')
        if request and request.user == data.get('reported_user'):
            raise serializers.ValidationError("You cannot report yourself.")
        return data


class ReportListSerializer(serializers.ModelSerializer):
    """Serializer for listing reports (admin view)"""
    reporter_email = serializers.EmailField(source='reporter.email', read_only=True)
    reporter_name = serializers.CharField(source='reporter.first_name', read_only=True)
    reported_user_email = serializers.EmailField(source='reported_user.email', read_only=True)
    reported_user_name = serializers.CharField(source='reported_user.first_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.first_name', read_only=True, allow_null=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'reporter_email', 'reporter_name', 'reported_user_email', 
            'reported_user_name', 'reason', 'description', 'status', 
            'admin_notes', 'created_at', 'reviewed_at', 'reviewed_by_name'
        ]
        read_only_fields = ['id', 'created_at']


class PublicProfileSerializer(serializers.ModelSerializer):
    """Serializer for viewing other users' profiles (filtered data)"""
    photos = ProfilePhotoSerializer(many=True, read_only=True)
    photo_count = serializers.ReadOnlyField()
    primary_photo_url = serializers.SerializerMethodField()
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'user_id', 'user_name', 'bio', 'age', 'interests', 'hobbies',
            'photos', 'photo_count', 'primary_photo_url'
        ]
    
    def get_primary_photo_url(self, obj):
        primary = obj.primary_photo
        if primary and primary.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary.image.url)
            return primary.image.url
        return None
