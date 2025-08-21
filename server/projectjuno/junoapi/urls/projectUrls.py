from django.urls import path
from junoapi.views.ProjectViews import ProjectView, DeleteProject

urlpatterns = [
    path('', ProjectView.as_view()),
    path('<int:pk>/delete', DeleteProject.as_view()),
]