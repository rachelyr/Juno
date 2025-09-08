from django.urls import path
from junoapi.views.TeamViews import ListCreateTeamView, AddTeamMemberView, deleteTeam, AttachProjectToTeamView, GetTeamProject, RemoveTeamProject
from junoapi.views.SearchView import UserSearchView

urlpatterns = [
    path('', ListCreateTeamView.as_view(), name="list-create-team"),
    path('<int:pk>/members/', AddTeamMemberView.as_view(), name='add-team-member'),
    path('<int:pk>/delete', deleteTeam.as_view(), name='delete-team'),
    path('<int:team_id>/project/<int:project_id>', AttachProjectToTeamView.as_view(), name='attach-project-team'),
    path('project', GetTeamProject.as_view(), name='get-project-team'),
    path('<int:team_id>/project/<int:project_id>/delete', RemoveTeamProject.as_view(), name='delete-project-team'),
    path('search/', UserSearchView.as_view()),
]