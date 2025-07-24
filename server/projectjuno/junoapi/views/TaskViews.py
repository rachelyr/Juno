from django.shortcuts import render
from rest_framework import generics
from django.db.models import Q  

from junoapi.models import Task
from junoapi.serializers import TaskSerializer, TaskStatusSerializer
from junoapi.selectors import get_tasks

class TaskView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        project_id = self.request.query_params.get('project_id')    
        return get_tasks(project_id=project_id)
    
    # def perform_create(self, serializer):
    #     task = serializer.save()
    #     assigned_user = task.assigned_userid

    #     if assigned_user:
    #         send_task_assigned_notification(assigned_user, task.title)
    
class UpdateTaskStatus(generics.UpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskStatusSerializer
    lookup_field = 'pk'

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    
class GetUserTasksView(generics.ListAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        user_id = self.kwargs['pk']

        return Task.objects.filter(
            Q(author_userid = user_id) | Q(assigned_userid = user_id)
        )

class UpdateTaskView(generics.RetrieveUpdateAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        project_id = self.request.query_params.get('project_id')
        return Task.objects.filter(project_id=project_id)