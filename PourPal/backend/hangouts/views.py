from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Hangout, HangoutMemory, HangoutMemoryPhoto
from .serializers import (
    HangoutSerializer, 
    HangoutCreateSerializer,
    HangoutMemorySerializer,
    HangoutMemoryPhotoSerializer
)


@method_decorator(csrf_exempt, name='dispatch')
class HangoutListCreateView(generics.ListCreateAPIView):
    """API endpoint for listing and creating hangouts"""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return HangoutCreateSerializer
        return HangoutSerializer
    
    def get_queryset(self):
        # Only show upcoming hangouts
        return Hangout.objects.filter(
            date_time__gte=timezone.now()
        ).order_by('date_time')
    
    def perform_create(self, serializer):
        # Set the creator and add them as a participant
        hangout = serializer.save(creator=self.request.user)
        hangout.participants.add(self.request.user)


@method_decorator(csrf_exempt, name='dispatch')
class HangoutDetailView(generics.RetrieveUpdateDestroyAPIView):
    """API endpoint for retrieving, updating, or deleting a hangout"""
    queryset = Hangout.objects.all()
    serializer_class = HangoutSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def delete(self, request, *args, **kwargs):
        hangout = self.get_object()
        if hangout.creator != request.user:
            return Response({
                'error': 'Only the creator can delete this hangout'
            }, status=status.HTTP_403_FORBIDDEN)
        return super().delete(request, *args, **kwargs)


@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_hangout(request, pk):
    """API endpoint for joining a hangout"""
    try:
        hangout = Hangout.objects.get(pk=pk)
    except Hangout.DoesNotExist:
        return Response({
            'error': 'Hangout not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check if hangout is full
    if hangout.participants.count() >= hangout.max_group_size:
        return Response({
            'error': 'This hangout is full'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user is already a participant
    if request.user in hangout.participants.all():
        return Response({
            'error': 'You are already in this hangout'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    hangout.participants.add(request.user)
    return Response({
        'message': 'Successfully joined hangout',
        'hangout': HangoutSerializer(hangout).data
    }, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def leave_hangout(request, pk):
    """API endpoint for leaving a hangout"""
    try:
        hangout = Hangout.objects.get(pk=pk)
    except Hangout.DoesNotExist:
        return Response({
            'error': 'Hangout not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is a participant
    if request.user not in hangout.participants.all():
        return Response({
            'error': 'You are not in this hangout'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Don't allow creator to leave
    if hangout.creator == request.user:
        return Response({
            'error': 'Creator cannot leave. Delete the hangout instead.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    hangout.participants.remove(request.user)
    return Response({
        'message': 'Successfully left hangout',
        'hangout': HangoutSerializer(hangout).data
    }, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_hangouts(request):
    """API endpoint for getting user's hangouts"""
    upcoming = Hangout.objects.filter(
        participants=request.user,
        date_time__gte=timezone.now()
    ).order_by('date_time')
    
    past = Hangout.objects.filter(
        participants=request.user,
        date_time__lt=timezone.now()
    ).order_by('-date_time')
    
    return Response({
        'upcoming': HangoutSerializer(upcoming, many=True).data,
        'past': HangoutSerializer(past, many=True).data
    }, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_memory_photo(request, pk):
    """API endpoint for uploading memory photos to a hangout"""
    try:
        hangout = Hangout.objects.get(pk=pk)
    except Hangout.DoesNotExist:
        return Response({
            'error': 'Hangout not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is a participant
    if request.user not in hangout.participants.all():
        return Response({
            'error': 'Only participants can upload memory photos'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Get or create memory for this hangout
    memory, created = HangoutMemory.objects.get_or_create(hangout=hangout)
    
    # Check photo limit (max 3)
    if memory.photo_count >= 3:
        return Response({
            'error': 'Maximum 3 memory photos allowed per hangout'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate image
    if 'image' not in request.FILES:
        return Response({
            'error': 'No image file provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create memory photo
    serializer = HangoutMemoryPhotoSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(memory=memory, uploaded_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_memory_photo(request, pk, photo_id):
    """API endpoint for deleting a memory photo"""
    try:
        hangout = Hangout.objects.get(pk=pk)
        memory = hangout.memory
        photo = memory.photos.get(id=photo_id)
    except (Hangout.DoesNotExist, HangoutMemory.DoesNotExist, HangoutMemoryPhoto.DoesNotExist):
        return Response({
            'error': 'Photo not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Only the uploader or hangout creator can delete
    if photo.uploaded_by != request.user and hangout.creator != request.user:
        return Response({
            'error': 'Only the uploader or hangout creator can delete this photo'
        }, status=status.HTTP_403_FORBIDDEN)
    
    photo.delete()
    return Response({
        'message': 'Memory photo deleted successfully'
    }, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def get_hangout_memories(request, pk):
    """API endpoint for getting hangout memories"""
    try:
        hangout = Hangout.objects.get(pk=pk)
        memory = hangout.memory
    except Hangout.DoesNotExist:
        return Response({
            'error': 'Hangout not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except HangoutMemory.DoesNotExist:
        return Response({
            'photos': [],
            'photo_count': 0
        }, status=status.HTTP_200_OK)
    
    serializer = HangoutMemorySerializer(memory, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def end_hangout(request, pk):
    """API endpoint for manually ending a hangout"""
    try:
        hangout = Hangout.objects.get(pk=pk)
    except Hangout.DoesNotExist:
        return Response({
            'error': 'Hangout not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Only creator can end the hangout
    if hangout.creator != request.user:
        return Response({
            'error': 'Only the creator can end this hangout'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Check if already ended
    if hangout.is_ended:
        return Response({
            'error': 'Hangout is already ended'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # End the hangout
    hangout.end_hangout()
    
    return Response({
        'message': 'Hangout ended successfully',
        'hangout': HangoutSerializer(hangout).data
    }, status=status.HTTP_200_OK)
