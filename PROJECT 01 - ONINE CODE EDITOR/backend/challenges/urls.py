from django.urls import path
from .views import ChallengeListView, ChallengeDetailView, ChallengeSubmitView, UserChallengeProgressView

urlpatterns = [
    path('', ChallengeListView.as_view(), name='challenge_list'),
    path('my-progress/', UserChallengeProgressView.as_view(), name='challenge_progress'),
    path('<slug:slug>/', ChallengeDetailView.as_view(), name='challenge_detail'),
    path('<slug:slug>/submit/', ChallengeSubmitView.as_view(), name='challenge_submit'),
]
