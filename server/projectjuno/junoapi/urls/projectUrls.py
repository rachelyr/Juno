from django.urls import path
from junoapi.views.ProjectViews import ProjectView, DeleteProject

urlpatterns = [
    path('', ProjectView.as_view()),
    path('<int:pk>/', DeleteProject.as_view()),
]