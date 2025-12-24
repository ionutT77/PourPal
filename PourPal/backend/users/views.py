from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.db import models
from .models import User, Profile, ProfilePhoto, AgeVerification, Report, Connection
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    UserLoginSerializer,
    ProfileSerializer,
    ProfilePhotoSerializer,
    AgeVerificationSerializer,
    ReportSerializer,
    ReportListSerializer,
    PublicProfileSerializer,
    ConnectionSerializer,
    UserSearchSerializer
)


@method_decorator(csrf_exempt, name='dispatch')
class UserRegistrationView(APIView):
    """API endpoint for user registration"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class UserLoginView(APIView):
    """API endpoint for user login"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            user = authenticate(request, username=email, password=password)
            if user:
                login(request, user)
                return Response({
                    'message': 'Login successful',
                    'user': UserSerializer(user).data
                }, status=status.HTTP_200_OK)
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class UserLogoutView(APIView):
    """API endpoint for user logout"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        logout(request)
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class UserProfileView(generics.RetrieveUpdateAPIView):
    """API endpoint for viewing and updating user profile"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user


@method_decorator(csrf_exempt, name='dispatch')
class ProfileUpdateView(generics.RetrieveUpdateAPIView):
    """API endpoint for updating profile details"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileSerializer
    
    def get_object(self):
        return self.request.user.profile


@method_decorator(csrf_exempt, name='dispatch')
class ProfilePhotoUploadView(APIView):
    """API endpoint for uploading profile photos (max 4)"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        profile = request.user.profile
        
        # Check if user already has 4 photos
        if profile.photos.count() >= 4:
            return Response({
                'error': 'Maximum 4 photos allowed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ProfilePhotoSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(profile=profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class ProfilePhotoDeleteView(APIView):
    """API endpoint for deleting a profile photo"""
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, photo_id):
        try:
            photo = ProfilePhoto.objects.get(
                id=photo_id,
                profile=request.user.profile
            )
            photo.delete()
            return Response({
                'message': 'Photo deleted successfully'
            }, status=status.HTTP_200_OK)
        except ProfilePhoto.DoesNotExist:
            return Response({
                'error': 'Photo not found'
            }, status=status.HTTP_404_NOT_FOUND)


@method_decorator(csrf_exempt, name='dispatch')
class ProfilePhotoUpdateView(APIView):
    """API endpoint for updating photo (set primary, reorder)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, photo_id):
        try:
            photo = ProfilePhoto.objects.get(
                id=photo_id,
                profile=request.user.profile
            )
            serializer = ProfilePhotoSerializer(
                photo, 
                data=request.data, 
                partial=True,
                context={'request': request}
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ProfilePhoto.DoesNotExist:
            return Response({
                'error': 'Photo not found'
            }, status=status.HTTP_404_NOT_FOUND)


@method_decorator(csrf_exempt, name='dispatch')
class ProfilePhotoReorderView(APIView):
    """API endpoint for reordering profile photos"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        photo_ids = request.data.get('photo_ids', [])
        
        if not photo_ids:
            return Response({
                'error': 'No photo IDs provided'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        profile = request.user.profile
        
        # Verify all photos belong to user
        user_photos = list(profile.photos.values_list('id', flat=True))
        if not all(pid in user_photos for pid in photo_ids):
            return Response({
                'error': 'Invalid photo IDs provided'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # Update order
        try:
            for index, photo_id in enumerate(photo_ids):
                photo = ProfilePhoto.objects.get(id=photo_id)
                photo.order = index
                photo.is_primary = (index == 0)
                photo.save()
                
            # Return updated photos
            updated_photos = ProfilePhoto.objects.filter(profile=profile).order_by('order')
            serializer = ProfilePhotoSerializer(
                updated_photos, 
                many=True,
                context={'request': request}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class AgeVerificationUploadView(APIView):
    """API endpoint for uploading age verification document"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        user = request.user
        
        # Check if verification already exists
        try:
            verification = AgeVerification.objects.get(user=user)
            # If already approved, don't allow re-upload
            if verification.status == 'approved':
                return Response({
                    'error': 'Your age is already verified'
                }, status=status.HTTP_400_BAD_REQUEST)
            # If pending or rejected, allow re-upload by deleting old one
            verification.delete()
        except AgeVerification.DoesNotExist:
            pass
        
        # Create new verification
        serializer = AgeVerificationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class AgeVerificationStatusView(APIView):
    """API endpoint for checking age verification status"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            verification = AgeVerification.objects.get(user=request.user)
            serializer = AgeVerificationSerializer(verification, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except AgeVerification.DoesNotExist:
            return Response({
                'status': 'not_uploaded',
                'message': 'No verification document uploaded'
            }, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class AgeVerificationApproveView(APIView):
    """API endpoint for admin to approve age verification"""
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, verification_id):
        try:
            verification = AgeVerification.objects.get(id=verification_id)
            verification.status = 'approved'
            verification.verified_at = timezone.now()
            verification.verified_by = request.user
            verification.save()
            
            return Response({
                'message': 'Verification approved successfully'
            }, status=status.HTTP_200_OK)
        except AgeVerification.DoesNotExist:
            return Response({
                'error': 'Verification not found'
            }, status=status.HTTP_404_NOT_FOUND)


@method_decorator(csrf_exempt, name='dispatch')
class AgeVerificationRejectView(APIView):
    """API endpoint for admin to reject age verification"""
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, verification_id):
        try:
            verification = AgeVerification.objects.get(id=verification_id)
            reason = request.data.get('reason', 'Document unclear or invalid')
            
            verification.status = 'rejected'
            verification.rejection_reason = reason
            verification.save()
            
            return Response({
                'message': 'Verification rejected',
                'reason': reason
            }, status=status.HTTP_200_OK)
        except AgeVerification.DoesNotExist:
            return Response({
                'error': 'Verification not found'
            }, status=status.HTTP_404_NOT_FOUND)


# ========== REPORT SYSTEM VIEWS ==========

@method_decorator(csrf_exempt, name='dispatch')
class ReportCreateView(APIView):
    """API endpoint for submitting a report"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ReportSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(reporter=request.user)
            return Response({
                'message': 'Report submitted successfully',
                'report': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class ReportListView(APIView):
    """API endpoint for listing all reports (admin only)"""
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        # Filter by status if provided
        status_filter = request.query_params.get('status', None)
        
        if status_filter:
            reports = Report.objects.filter(status=status_filter)
        else:
            reports = Report.objects.all()
        
        serializer = ReportListSerializer(reports, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class ReportDetailView(APIView):
    """API endpoint for viewing a specific report (admin only)"""
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id)
            serializer = ReportListSerializer(report)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Report.DoesNotExist:
            return Response({
                'error': 'Report not found'
            }, status=status.HTTP_404_NOT_FOUND)


@method_decorator(csrf_exempt, name='dispatch')
class ReportUpdateStatusView(APIView):
    """API endpoint for updating report status (admin only)"""
    permission_classes = [permissions.IsAdminUser]
    
    def patch(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id)
            new_status = request.data.get('status')
            admin_notes = request.data.get('admin_notes', '')
            
            if new_status not in ['under_review', 'resolved', 'dismissed']:
                return Response({
                    'error': 'Invalid status. Must be: under_review, resolved, or dismissed'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update report using helper methods
            if new_status == 'under_review':
                report.mark_under_review(request.user)
            elif new_status == 'resolved':
                report.resolve(request.user, admin_notes)
            elif new_status == 'dismissed':
                report.dismiss(request.user, admin_notes)
            
            serializer = ReportListSerializer(report)
            return Response({
                'message': f'Report status updated to {new_status}',
                'report': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Report.DoesNotExist:
            return Response({
                'error': 'Report not found'
            }, status=status.HTTP_404_NOT_FOUND)


@method_decorator(csrf_exempt, name='dispatch')
class MyReportsView(APIView):
    """API endpoint for viewing user's own submitted reports"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        reports = Report.objects.filter(reporter=request.user)
        serializer = ReportSerializer(reports, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


# ========== PUBLIC PROFILE VIEW ==========

@method_decorator(csrf_exempt, name='dispatch')
class PublicProfileView(APIView):
    """API endpoint for viewing other users' public profiles"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            # Prevent viewing own profile through this endpoint
            if request.user.id == user_id:
                return Response({
                    'error': 'Use /api/users/profile/ to view your own profile'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get the user's profile
            user = User.objects.get(id=user_id)
            profile = user.profile
            
            serializer = PublicProfileSerializer(profile, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Profile.DoesNotExist:
            return Response({
                'error': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)



# ========== CONNECTION/FRIEND SYSTEM ==========

@method_decorator(csrf_exempt, name='dispatch')
class SendConnectionRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, user_id):
        if request.user.id == user_id:
            return Response({'error': 'Cannot send friend request to yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            friend = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if connection already exists
        existing = Connection.objects.filter(
            models.Q(user=request.user, friend=friend) | 
            models.Q(user=friend, friend=request.user)
        ).first()
        
        if existing:
            return Response({'error': f'Connection already exists with status: {existing.status}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        connection = Connection.objects.create(user=request.user, friend=friend)
        serializer = ConnectionSerializer(connection, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class AcceptConnectionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, connection_id):
        try:
            connection = Connection.objects.get(id=connection_id, friend=request.user, status='pending')
        except Connection.DoesNotExist:
            return Response({'error': 'Connection request not found'}, status=status.HTTP_404_NOT_FOUND)
        
        connection.accept()
        serializer = ConnectionSerializer(connection, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class RejectConnectionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, connection_id):
        try:
            connection = Connection.objects.get(id=connection_id, friend=request.user, status='pending')
        except Connection.DoesNotExist:
            return Response({'error': 'Connection request not found'}, status=status.HTTP_404_NOT_FOUND)
        
        connection.reject()
        serializer = ConnectionSerializer(connection, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class ListFriendsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get accepted connections where user is either sender or receiver
        connections = Connection.objects.filter(
            models.Q(user=request.user, status='accepted') | 
            models.Q(friend=request.user, status='accepted')
        )
        
        friends_data = []
        for conn in connections:
            friend = conn.friend if conn.user == request.user else conn.user
            friends_data.append({
                'id': friend.id,
                'first_name': friend.first_name,
                'username': friend.username,
                'connection_id': conn.id
            })
        
        return Response(friends_data, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class PendingRequestsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        pending = Connection.objects.filter(friend=request.user, status='pending')
        serializer = ConnectionSerializer(pending, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class RemoveConnectionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, connection_id):
        try:
            connection = Connection.objects.filter(
                models.Q(user=request.user) | models.Q(friend=request.user)
            ).get(id=connection_id)
        except Connection.DoesNotExist:
            return Response({'error': 'Connection not found'}, status=status.HTTP_404_NOT_FOUND)
        
        connection.delete()
        return Response({'message': 'Connection removed'}, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class SearchUsersView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        query = request.GET.get('username', '')
        if len(query) < 2:
            return Response({'error': 'Search query must be at least 2 characters'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        users = User.objects.filter(username__icontains=query).exclude(id=request.user.id)[:10]
        serializer = UserSearchSerializer(users, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class ConnectionStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        status_info = Connection.get_connection_status(request.user, user)
        return Response(status_info, status=status.HTTP_200_OK)
