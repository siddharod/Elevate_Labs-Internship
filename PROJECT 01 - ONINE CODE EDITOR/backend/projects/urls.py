from django.urls import path
from .views import (
    ProjectListCreateView, ProjectDetailView, ProjectDuplicateView,
    ProjectSaveBatchView, ProjectFileListCreateView, ProjectFileDetailView,
    ProjectHistoryListView, ProjectHistoryDetailView, ProjectRestoreVersionView,
    CodingActivityListView
)

urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='project_list_create'),
    path('activity/', CodingActivityListView.as_view(), name='coding_activity'),
    path('<int:pk>/', ProjectDetailView.as_view(), name='project_detail'),
    path('<int:pk>/duplicate/', ProjectDuplicateView.as_view(), name='project_duplicate'),
    path('<int:pk>/save/', ProjectSaveBatchView.as_view(), name='project_save_batch'),
    path('<int:pk>/files/', ProjectFileListCreateView.as_view(), name='project_files_list_create'),
    path('files/<int:file_id>/', ProjectFileDetailView.as_view(), name='project_file_detail'),
    path('<int:pk>/history/', ProjectHistoryListView.as_view(), name='project_history_list'),
    path('<int:pk>/history/<int:version_number>/', ProjectHistoryDetailView.as_view(), name='project_history_detail'),
    path('<int:pk>/restore/<int:version_number>/', ProjectRestoreVersionView.as_view(), name='project_restore_version'),
]
