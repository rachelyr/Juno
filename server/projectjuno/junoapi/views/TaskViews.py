from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q  

from junoapi.models import Task
from junoapi.serializers import TaskSerializer, TaskStatusSerializer
from junoapi.selectors import get_tasks

class TaskView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.request.query_params.get('project_id')    
        return get_tasks(project_id=project_id)
    
class UpdateTaskStatus(generics.UpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskStatusSerializer
    permission_classes = [IsAuthenticated]
    
    lookup_field = 'pk'

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    
class GetUserTasksView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return Task.objects.filter(
            Q(assigned_userid = user.id)
        )
    
class UpdateTaskView(generics.RetrieveUpdateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.request.query_params.get('project_id')
        return Task.objects.filter(project_id=project_id)