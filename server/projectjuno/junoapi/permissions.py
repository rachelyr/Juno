from junoapi.models import ProjectTeam, Team, Task

from rest_framework.permissions import BasePermission
from django.db.models import Q

#Permissions - Project
class isOwner(BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.groups.filter(name='Admin').exists():
            return True
        return obj.owner_id == request.user
    
class canAcessProject(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user

        if obj.owner_id == user or obj.owner_id_id == user.id:
            return True
        
        print("Owner:", obj.owner_id, obj.owner_id_id)
        print("Request user:", user, user.id)

        project_team = ProjectTeam.objects.filter(project_id=obj).values_list("team_id", flat=True)
        user_teams = Team.objects.filter(
            Q(id__in=project_team) & 
            (Q(productowner_userid=user) | Q(projectmanager_userid=user) | Q(members=user))
        )
        return user_teams.exists()
    
#Permissions - Teams
class IsProductOwner(BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.groups.filter(name="Admin").exists():
            return True
        return obj.productowner_userid == request.user

class IsOwnerOrManager(BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.groups.filter(name="Admin").exists():
            return True
        return(
            obj.productowner_userid == request.user or
            obj.projectmanager_userid == request.user
        )
    
#Permissions - Comment
class IsAdminOrCommentOwner(BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.groups.filter(name="Admin").exists():
            return True
        return obj.user_id.id == request.user.id

#Permissions - Task
class isAdminOrTaskAuthor(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.groups.filter(name="Admin").exists():
            return True
        
        return(obj.author_userid == request.user)