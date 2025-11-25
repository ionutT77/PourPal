from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Hangout
from .serializers import HangoutSerializer, HangoutCreateSerializer


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
