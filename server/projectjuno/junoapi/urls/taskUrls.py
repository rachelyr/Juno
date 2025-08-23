from django.urls import path
from junoapi.views.TaskViews import TaskView, UpdateTaskStatus, GetUserTasksView, UpdateTaskView, DeleteTaskView
from junoapi.views.SearchView import SearchView

urlpatterns = [
    path('search/', SearchView.as_view()),
    #Task URLS
    path('tasks/', TaskView.as_view()),
    path('tasks/<int:pk>/', UpdateTaskView.as_view()),
    path('tasks/<int:pk>/status/', UpdateTaskStatus.as_view()),
    path('tasks/user/<int:pk>', GetUserTasksView.as_view()),
    path('tasks/<int:pk>/delete', DeleteTaskView.as_view()),
]