from junoapi.models import User, Task, Project
from junoapi.serializers import TaskSerializer, ProjectSerializer, UserSerializer
from rest_framework.views import APIView
from rest_framework.response import Response

from django.db.models import Q
from django.contrib.postgres.search import TrigramSimilarity

class SearchView(APIView):
    def get(self, request):
        q = request.query_params.get('q', '')

        users = User.objects.annotate(
            similarity = TrigramSimilarity('first_name',q)
        ).filter(
            Q(first_name__icontains=q) |
            Q(similarity__gt=0.2) #the similarity threshold
        )

        task = Task.objects.annotate(
            title_similarity = TrigramSimilarity('title',q),
            description_similarity = TrigramSimilarity('description',q),
        ).filter(
            Q(title__icontains=q) | Q(description__icontains=q) |
            Q(title_similarity__gt = 0.2) | Q(description_similarity__gt = 0.2)
        )

        project = Project.objects.annotate(
            name_similarity = TrigramSimilarity('name',q),
            description_similarity = TrigramSimilarity('description',q)
        ).filter(
            Q(name__icontains=q) | Q(description__icontains=q) |
            Q(name_similarity__gt = 0.2) | Q(description_similarity__gt = 0.2)
        )   

        user_data = UserSerializer(users, many=True).data
        task_data = TaskSerializer(task, many=True).data
        project_data = ProjectSerializer(project, many=True).data

        return Response({
            'users': user_data,
            'tasks': task_data,
            'projects': project_data
        })