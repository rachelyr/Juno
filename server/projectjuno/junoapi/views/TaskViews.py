from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics

from junoapi.models import Task
from junoapi.serializers import TaskSerializer, TaskStatusSerializer

class TaskView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        project_id = self.request.query_params.get('project_id')

        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        return queryset
    
class UpdateTaskStatus(generics.UpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskStatusSerializer
    lookup_field = 'pk'

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)