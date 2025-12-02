from django.urls import path
from .views import (
    HangoutListCreateView,
    HangoutDetailView,
    join_hangout,
    leave_hangout,
    my_hangouts,
    upload_memory_photo,
    delete_memory_photo,
    get_hangout_memories,
    end_hangout,
    get_recommended_hangouts
)

urlpatterns = [
    path('', HangoutListCreateView.as_view(), name='hangout-list-create'),
    path('<int:pk>/', HangoutDetailView.as_view(), name='hangout-detail'),
    path('<int:pk>/join/', join_hangout, name='hangout-join'),
    path('<int:pk>/leave/', leave_hangout, name='hangout-leave'),
    path('<int:pk>/end/', end_hangout, name='hangout-end'),
    path('my-hangouts/', my_hangouts, name='my-hangouts'),
    path('recommended/', get_recommended_hangouts, name='recommended-hangouts'),
    path('<int:pk>/memories/', get_hangout_memories, name='hangout-memories'),
    path('<int:pk>/memories/upload/', upload_memory_photo, name='upload-memory-photo'),
    path('<int:pk>/memories/<int:photo_id>/delete/', delete_memory_photo, name='delete-memory-photo'),
]
