from rest_framework import serializers
from .models import User, Team, Task, TaskAssignment, Project, ProjectTeam, Attachment, Comment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class TeamSerializer(serializers.ModelSerializer):
    product_owner_username = serializers.CharField(source='productowner_userid.username', read_only=True)
    project_manager_username = serializers.CharField(source='projectmanager_userid.username', read_only=True)

    class Meta:
        model = Team
        fields = '__all__'

#may not be required
class TaskAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskAssignment
        fields = '__all__'
    
class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id','file_url','file_name','task_id','uploadedby_id']
        read_only_fields = ['task_id','uploadedby_id']
    
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
    username = serializers.CharField(read_only=True, source='user_id.username')
    class Meta:
        model = Comment
        fields = ['id','text','task_id','user_id','username']
        read_only_fields = ['task_id','user_id']

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