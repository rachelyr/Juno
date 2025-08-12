from django.urls import path
from junoapi.views.TeamViews import ListCreateTeamView, AddTeamMemberView, deleteTeam, AttachProjectToTeamView, GetTeamProject, RemoveTeamProject
from junoapi.views.SearchView import UserSearchView

urlpatterns = [
    path('', ListCreateTeamView.as_view()),
    path('<int:pk>/members/', AddTeamMemberView.as_view()),
    path('<int:pk>/delete/', deleteTeam.as_view()),
    path('<int:team_id>/project/<int:project_id>', AttachProjectToTeamView.as_view()),
    path('project', GetTeamProject.as_view()),
    path('<int:team_id>/project/<int:project_id>/delete', RemoveTeamProject.as_view()),
    path('search/', UserSearchView.as_view()),
]