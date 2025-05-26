from rest_framework import serializers
from .models import User, Team, Task, TaskAssignment, Project, ProjectTeam, Attatchment, Comment


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

#----Task serializers----
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
class TaskStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['status']

#may not be required
class TaskAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskAssignment
        fields = '__all__'
    
class AttatchmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attatchment
        fields = '__all__'
    
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

#may not be required
class ProjectTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectTeam
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'