from rest_framework import serializers
from .models import User, Team, Task, TaskAssignment, Project, ProjectTeam, Attachment, Comment


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

#may not be required
class TaskAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskAssignment
        fields = '__all__'
    
class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
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

#----Task serializers----
class TaskSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True, source='author_userid')
    assigned = UserSerializer(read_only=True, source='assigned_userid')
    comment = CommentSerializer(many=True, read_only=True)
    attachment = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title','description', 'status', 'priority', 'tags', 'start_date',
                'due_date', 'points', 'project_id', 'author_userid','assigned_userid',
                'author', 'assigned','comment', 'attachment']
        
class TaskStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['status']