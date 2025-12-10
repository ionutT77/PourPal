from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Chat
from .serializers import ChatSerializer
from hangouts.models import Hangout


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