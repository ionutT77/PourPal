from django.urls import path
from . import views

urlpatterns = [
    path('<int:hangout_id>/messages/', views.ChatMessageListView.as_view(), name='chat-messages'),
    # Private messaging
    path('private/send/', views.SendPrivateMessageView.as_view(), name='send-private-message'),
    path('private/<int:user_id>/', views.GetConversationView.as_view(), name='get-conversation'),
    path('private/conversations/', views.ListConversationsView.as_view(), name='list-conversations'),
    path('private/<int:user_id>/read/', views.MarkMessagesReadView.as_view(), name='mark-messages-read'),
]
