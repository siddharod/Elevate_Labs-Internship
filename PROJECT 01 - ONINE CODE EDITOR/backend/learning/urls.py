from django.urls import path
from .views import LessonListView, LessonDetailView, LessonCompleteView

urlpatterns = [
    path('lessons/', LessonListView.as_view(), name='lesson_list'),
    path('lessons/<slug:slug>/', LessonDetailView.as_view(), name='lesson_detail'),
    path('lessons/<slug:slug>/complete/', LessonCompleteView.as_view(), name='lesson_complete'),
]
