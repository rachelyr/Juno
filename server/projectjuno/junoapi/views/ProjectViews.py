from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics

from junoapi.models import Project
from junoapi.serializers import ProjectSerializer

class ProjectView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset