from django.shortcuts import render
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission

from junoapi.models import Project, Team, ProjectTeam
from junoapi.serializers import ProjectSerializer
from junoapi.permissions import isOwner, canAcessProject

class ProjectView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, canAcessProject]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [IsAuthenticated(), canAcessProject()]

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
    
#API mainly used to handle faulty urls arriving from the frontend
class ProjectDetailView(generics.RetrieveAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, canAcessProject]

    def get(self, request, *args, **kwargs):
        try:
            return self.retrieve(request, *args, **kwargs)
        except Project.DoesNotExist:
            return Response({"error": "Project not Found"}, status=status.HTTP_404_NOT_FOUND)

class GetUserOwnedProjects(generics.ListAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, isOwner]

    def get_queryset(self):
        user = self.request.user

        return Project.objects.filter(owner_id=user)

class DeleteProject(generics.DestroyAPIView):
    queryset = Project.objects.all()
    serializer_class= ProjectSerializer
    permission_classes = [IsAuthenticated, isOwner]

    def get_queryset(self):
        return self.queryset.filter(owner_id=self.request.user.id)