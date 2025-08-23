from rest_framework import generics
from rest_framework.views import APIView
from junoapi.serializers import TeamSerializer, ProjectTeamSerializer
from junoapi.models import Team, User, Project, ProjectTeam
from junoapi.selectors import get_teams

from django.db.models import Q
from django.db import transaction

from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework import status

    
class ListCreateTeamView(generics.ListCreateAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Team.objects.filter(
            Q(productowner_userid=user) |
            Q(projectmanager_userid=user) |
            Q(members=user)
            ).distinct()

    def create(self, request, *args, **kwargs):
        member_usernames = request.data.get('members', [])

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic(): #may need to be removed
            team = serializer.save()

            if member_usernames:
                result = self.add_members_by_username(team, member_usernames)
                if result.get('error'):
                    return Response(result, status=status.HTTP_400_BAD_REQUEST)
                
        return Response(self.get_serializer(team).data, status=status.HTTP_201_CREATED)
    
    def add_members_by_username(self, team, usernames):
        if not isinstance(usernames, list):
            return {'error': 'requires users list'}
        
        users = User.objects.filter(username__in=usernames)
        found_usernames =  set(users.values_list('username', flat=True))

        invalid_usernames = set(usernames) - found_usernames
        if invalid_usernames:
            return {'error': f"User not found: {', '.join(invalid_usernames)}"}
        
        team.members.add(*users)
        return {'success': True, 'added_members': list(found_usernames)}
    
class AddTeamMemberView(generics.UpdateAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

    def update(self, request, *args, **kwargs):
        team = self.get_object()
        usernames = request.data.get('members', [])

        if not isinstance(usernames, list):
            return Response({"error": "Enter existing user"}, status=status.HTTP_400_BAD_REQUEST)
        
        users = User.objects.filter(username__in=usernames)
        found_usernames = set(users.values_list('username', flat=True))
        invalid_usernames = set(usernames) - found_usernames

        if invalid_usernames:
            return Response(
                {"error": f"User not found: {', '.join(invalid_usernames)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        team.members.add(*users)

        return Response({
            "message": "Members added successfully",
            "team": TeamSerializer(team).data
        }, status=status.HTTP_200_OK)

class deleteTeam(generics.DestroyAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(
            Q(productowner_userid=self.request.user.id) |
            Q(projectmanager_userid=self.request.user.id)
        )

class AttachProjectToTeamView(APIView):
    def post(self, request, team_id, project_id):
        if not team_id or not project_id:
            return Response({'detail': 'team_id and project_id are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            team = Team.objects.get(id=team_id)
            project = Project.objects.get(id=project_id)
        except(Team.DoesNotExist, Project.DoesNotExist):
            return Response({'detail': 'Invalid team or project ID.'}, status=status.HTTP_404_NOT_FOUND)
        
        if ProjectTeam.objects.filter(team_id=team_id).exists():
            return Response({'detail': 'Team has already been assigned a project.'}, status=status.HTTP_400_BAD_REQUEST)
        
        ProjectTeam.objects.create(team_id=team, project_id=project)

        reponse_data = {
            'team_id': team.id,
            'project_id': project.id
        }
        return Response(reponse_data, status=status.HTTP_201_CREATED)
    
class GetTeamProject(generics.ListAPIView):
    queryset = ProjectTeam.objects.all()
    serializer_class = ProjectTeamSerializer

class RemoveTeamProject(generics.DestroyAPIView):
    queryset = ProjectTeam.objects.all()
    serializer_class = ProjectTeamSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        team_id = self.kwargs['team_id']
        project_id = self.kwargs['project_id']

        project_team = ProjectTeam.objects.get(team_id=team_id, project_id=project_id)

        team = project_team.team_id
        user = self.request.user

        if(team.productowner_userid != user and team.projectmanager_userid != user):
            raise PermissionDenied("Only the Product Owner or Project Manager can remove this project from the team.")

        return project_team