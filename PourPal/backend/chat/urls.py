from django.urls import path
from . import views

urlpatterns = [
    path('<int:hangout_id>/messages/', views.ChatMessageListView.as_view(), name='chat-messages'),
]
