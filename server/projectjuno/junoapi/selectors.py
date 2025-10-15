from .models import Task
from .serializers import Team

#Task selector
def get_tasks(*, project_id=None):
    queryset = Task.objects.select_related(
        'author_userid',
        'assigned_userid'
    ).prefetch_related(
        'comment',
        'attachment'
    )

    if project_id:
        queryset= queryset.filter(project_id=project_id)
    
    return queryset

#Team selector -- will add the teams by id functionality later (only shows teams in which the user is in)
def get_teams(self):
    queryset = Team.objects.select_related(
        'productowner_userid',
        'projectmanager_userid'
    )
    
    return queryset