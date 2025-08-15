from django.shortcuts import render
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
        queryset = super().get_queryset()
        return queryset
    
class DeleteProject(generics.DestroyAPIView):
    queryset = Project.objects.all()
    serializer_class= ProjectSerializer
    # permission_classes = [isAuthenticated]

    # def get_queryset(self):
    #restrict delete access
    #     return self.queryset.filter(owner=self.request.user)