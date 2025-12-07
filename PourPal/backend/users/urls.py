from django.urls import path
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    UserProfileView,
    ProfileUpdateView,
    ProfilePhotoUploadView,
    ProfilePhotoDeleteView,
    ProfilePhotoDeleteView,
    ProfilePhotoUpdateView,
    ProfilePhotoReorderView,
    AgeVerificationUploadView,
    AgeVerificationStatusView,
    AgeVerificationApproveView,
    AgeVerificationRejectView
)
from .test_views import test_api

urlpatterns = [
    path('test/', test_api, name='api-test'),
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('logout/', UserLogoutView.as_view(), name='user-logout'),
    path('profile/', ProfileUpdateView.as_view(), name='user-profile'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
    path('profile/photos/', ProfilePhotoUploadView.as_view(), name='profile-photo-upload'),
    path('profile/photos/<int:photo_id>/', ProfilePhotoDeleteView.as_view(), name='profile-photo-delete'),
    path('profile/photos/<int:photo_id>/update/', ProfilePhotoUpdateView.as_view(), name='profile-photo-update'),
    path('profile/photos/reorder/', ProfilePhotoReorderView.as_view(), name='profile-photo-reorder'),
    # Age Verification
    path('age-verification/upload/', AgeVerificationUploadView.as_view(), name='age-verification-upload'),
    path('age-verification/status/', AgeVerificationStatusView.as_view(), name='age-verification-status'),
    path('age-verification/<int:verification_id>/approve/', AgeVerificationApproveView.as_view(), name='age-verification-approve'),
    path('age-verification/<int:verification_id>/reject/', AgeVerificationRejectView.as_view(), name='age-verification-reject'),
]
