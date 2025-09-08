from django.urls import path
from junoapi.views.TaskViews import TaskView, UpdateTaskStatus, GetUserTasksView, UpdateTaskView, DeleteTaskView
from junoapi.views.SearchView import SearchView

urlpatterns = [
    path('search/', SearchView.as_view()),
    #Task URLS
    path('tasks/', TaskView.as_view(), name='create-list-tasks'),
    path('tasks/<int:pk>/', UpdateTaskView.as_view(), name='update-task'),
    path('tasks/<int:pk>/status/', UpdateTaskStatus.as_view(), name='update-task-status'),
    path('tasks/user/<int:pk>', GetUserTasksView.as_view(), name='get-user-tasks'),
    path('tasks/<int:pk>/delete', DeleteTaskView.as_view(), name='delete-task'),
]