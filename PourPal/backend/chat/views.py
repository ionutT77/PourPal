from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.db.models import Q
from .models import Chat, PrivateMessage
from .serializers import ChatSerializer, PrivateMessageSerializer, ConversationSerializer
from hangouts.models import Hangout
from users.models import User, Connection


class ChatMessageListView(generics.ListAPIView):
    """
    Get chat message history for a hangout.
    Only accessible to participants.
    """
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        hangout_id = self.kwargs['hangout_id']
        
        # Check if user is a participant
        try:
            hangout = Hangout.objects.get(id=hangout_id)
            if not hangout.participants.filter(id=self.request.user.id).exists():
                raise PermissionDenied("You must be a participant to view this chat.")
        except Hangout.DoesNotExist:
            raise PermissionDenied("Hangout not found.")
        
        return Chat.objects.filter(hangout_id=hangout_id).select_related('user', 'user__profile')


# ========== PRIVATE MESSAGING VIEWS ==========

from rest_framework.views import APIView
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db.models import Q, Max, Count
from .models import PrivateMessage
from .serializers import PrivateMessageSerializer, ConversationSerializer
from users.models import Connection


@method_decorator(csrf_exempt, name='dispatch')
class SendPrivateMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        receiver_id = request.data.get('receiver')
        message_text = request.data.get('message')
        
        if not receiver_id or not message_text:
            return Response({'error': 'Receiver and message are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if users are friends
        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not Connection.are_friends(request.user, receiver):
            return Response({'error': 'You can only message friends'}, status=status.HTTP_403_FORBIDDEN)
        
        message = PrivateMessage.objects.create(
            sender=request.user,
            receiver=receiver,
            message=message_text
        )
        
        serializer = PrivateMessageSerializer(message, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class GetConversationView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            other_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if users are friends
        if not Connection.are_friends(request.user, other_user):
            return Response({'error': 'You can only view conversations with friends'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get all messages between the two users
        messages = PrivateMessage.objects.filter(
            Q(sender=request.user, receiver=other_user) |
            Q(sender=other_user, receiver=request.user)
        ).order_by('created_at')
        
        # Mark messages from other user as read
        PrivateMessage.objects.filter(
            sender=other_user,
            receiver=request.user,
            is_read=False
        ).update(is_read=True)
        
        serializer = PrivateMessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class ListConversationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get all users with whom current user has exchanged messages
        sent_to = PrivateMessage.objects.filter(sender=request.user).values_list('receiver', flat=True).distinct()
        received_from = PrivateMessage.objects.filter(receiver=request.user).values_list('sender', flat=True).distinct()
        
        user_ids = set(list(sent_to) + list(received_from))
        
        conversations = []
        for user_id in user_ids:
            other_user = User.objects.get(id=user_id)
            
            # Get last message
            last_message = PrivateMessage.objects.filter(
                Q(sender=request.user, receiver=other_user) |
                Q(sender=other_user, receiver=request.user)
            ).order_by('-created_at').first()
            
            # Get unread count
            unread_count = PrivateMessage.objects.filter(
                sender=other_user,
                receiver=request.user,
                is_read=False
            ).count()
            
            conversations.append({
                'user_id': other_user.id,
                'user_name': other_user.first_name,
                'last_message': last_message.message[:50] if last_message else '',
                'last_message_time': last_message.created_at if last_message else None,
                'unread_count': unread_count
            })
        
        # Sort by last message time
        conversations.sort(key=lambda x: x['last_message_time'] if x['last_message_time'] else timezone.now(), reverse=True)
        
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class MarkMessagesReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, user_id):
        try:
            other_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Mark all messages from other user as read
        updated = PrivateMessage.objects.filter(
            sender=other_user,
            receiver=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({'message': f'{updated} messages marked as read'}, status=status.HTTP_200_OK)
