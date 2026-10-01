from django.urls import path
from .views import ShareProjectCreateView, SharedProjectDetailView, RemixSharedProjectView

urlpatterns = [
    path('project/<int:project_id>/', ShareProjectCreateView.as_view(), name='share_project'),
    path('<str:share_id>/', SharedProjectDetailView.as_view(), name='shared_project_detail'),
    path('<str:share_id>/remix/', RemixSharedProjectView.as_view(), name='remix_shared_project'),
]
