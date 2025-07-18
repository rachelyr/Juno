from django.urls import path
from junoapi.views.ProjectViews import ProjectView
from junoapi.views.TaskViews import TaskView, UpdateTaskStatus, GetUserTasksView, UpdateTaskView
from junoapi.views.SearchView import SearchView
from junoapi.views.TeamViews import GetTeamsView

urlpatterns = [
    path('projects/', ProjectView.as_view()),
    path('search/', SearchView.as_view()),

    #Team URLS
    path('teams/', GetTeamsView.as_view()),

    #Task URLS
    path('tasks/', TaskView.as_view()),
    path('tasks/<int:pk>/', UpdateTaskView.as_view()),
    path('tasks/<int:pk>/status/', UpdateTaskStatus.as_view()),
    path('tasks/user/<int:pk>', GetUserTasksView.as_view()),    
]