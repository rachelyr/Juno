from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import generics

from junoapi.models import Task
from junoapi.serializers import TaskSerializer, TaskStatusSerializer
from junoapi.selectors import get_tasks

class TaskView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        project_id = self.request.query_params.get('project_id')    
        return get_tasks(project_id=project_id)
    
class UpdateTaskStatus(generics.UpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskStatusSerializer
    lookup_field = 'pk'

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)