from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound
from django.db.models import Q  

from junoapi.models import Task, User
from junoapi.serializers import TaskSerializer, TaskStatusSerializer
from junoapi.selectors import get_tasks
from junoapi.permissions import isAdminOrTaskAuthor

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
        pk = self.kwargs.get('pk')

        if not User.objects.filter(pk=pk).exists():
            raise NotFound(detail="User not found")
        return Task.objects.filter(assigned_userid=pk)
    
class UpdateTaskView(generics.RetrieveUpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, isAdminOrTaskAuthor]

    def get_queryset(self):
        project_id = self.request.query_params.get("project_id")
        return Task.objects.filter(project_id=project_id)
    

class DeleteTaskView(generics.DestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated,isAdminOrTaskAuthor]