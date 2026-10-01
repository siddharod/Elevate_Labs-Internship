from django.urls import path
from .views import CodeExecutionView

urlpatterns = [
    path('', CodeExecutionView.as_view(), name='code_execute'),
]
