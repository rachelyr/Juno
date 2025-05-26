from django.urls import path
from .views.ProjectViews import ProjectView
from .views.TaskViews import TaskView, UpdateTaskStatus

urlpatterns = [
    path('projects/', ProjectView.as_view()),
    path('tasks/', TaskView.as_view()),
    path('tasks/<int:pk>/status', UpdateTaskStatus.as_view())
]