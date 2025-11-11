from rest_framework import viewsets
from .models import Chat
from .serializers import ChatSerializer

class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer

    def perform_create(self, serializer):
        serializer.save()  # You can add additional logic here if needed.