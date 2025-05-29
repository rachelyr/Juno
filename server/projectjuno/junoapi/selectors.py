from .models import Task

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