from django.shortcuts import render
from django.db.models import Q
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from junoapi.models import Project, Team, ProjectTeam
from junoapi.serializers import ProjectSerializer

class ProjectView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        user_team = Team.objects.filter(
            Q(productowner_userid=user.id) |
            Q(projectmanager_userid=user.id) |
            Q(members=user) 
        )

        team_project = ProjectTeam.objects.filter(
            team_id__in = user_team
        ).values_list('project_id', flat=True)

        return Project.objects.filter(
            Q(owner_id=user) |
            Q(id__in=team_project)
        ).distinct()
    
class DeleteProject(generics.DestroyAPIView):
    queryset = Project.objects.all()
    serializer_class= ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(owner_id=self.request.user.id)