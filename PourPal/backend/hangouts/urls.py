from django.urls import path
from .views import (
    HangoutListCreateView,
    HangoutDetailView,
    join_hangout,
    leave_hangout,
    my_hangouts
)

urlpatterns = [
    path('', HangoutListCreateView.as_view(), name='hangout-list-create'),
    path('<int:pk>/', HangoutDetailView.as_view(), name='hangout-detail'),
    path('<int:pk>/join/', join_hangout, name='hangout-join'),
    path('<int:pk>/leave/', leave_hangout, name='hangout-leave'),
    path('my-hangouts/', my_hangouts, name='my-hangouts'),
]
