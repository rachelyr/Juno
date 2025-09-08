from django.urls import path
from junoapi.views.ProjectViews import ProjectView, ProjectDetailView, GetUserOwnedProjects, DeleteProject

urlpatterns = [
    path('', ProjectView.as_view(), name="project-list"),
    path('<int:pk>', ProjectDetailView.as_view(), name="project-detail"),
    path('user/',GetUserOwnedProjects.as_view(), name='user-projects'),
    path('<int:pk>/delete', DeleteProject.as_view(), name='delete-project'),
]