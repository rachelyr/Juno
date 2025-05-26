from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

# Create your models here.
class Team(models.Model):
    domain_name = models.CharField(max_length=100)
    productowner_userid = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name= 'team_product_owner'
    )
    projectmanager_userid = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name= 'team_project_manager'
    )

    class Meta:
        db_table = 'team'

    def __str__(self):
        return self.domain_name
    

class User(AbstractUser):
    cognito_id = models.CharField()
    profilepicture_id = models.CharField(blank=True) #S3 or cloudinary
    team_id = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'user'

    def __str__(self):
        return self.username

class Project(models.Model):
    name = models.CharField(max_length=30)
    description = models.CharField(max_length=250)
    start_date = models.DateTimeField()
    due_date = models.DateTimeField()

    class Meta:
        db_table = 'project'

    def __str__(self):
        return self.name

class ProjectTeam(models.Model):
    team_id = models.ForeignKey(Team, on_delete=models.CASCADE)
    project_id = models.ForeignKey(Project, on_delete=models.CASCADE)

    class Meta:
        db_table = 'project_team'

    def __str__(self):
        return f"team: {self.team_id}"

class Task(models.Model):
    title = models.CharField(max_length = 150)
    description = models.CharField(max_length = 250)
    status = models.CharField(max_length=25)
    priority = models.CharField(max_length=25)
    tags = models.CharField(max_length=50)
    start_date = models.DateTimeField()
    due_date = models.DateTimeField()
    points = models.IntegerField()
    project_id = models.ForeignKey(Project, on_delete=models.CASCADE)
    author_userid = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_author')
    assigned_userid = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='task_assigned')

    class Meta:
        db_table = 'task'

    def __str__(self):
        return self.title

class TaskAssignment(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    task_id = models.ForeignKey(Task, on_delete=models.CASCADE)

    class Meta:
        db_table = 'task_assignment'

class Attatchment(models.Model):
    file_url = models.URLField(max_length = 2048)
    file_name = models.CharField(max_length = 150)
    task_id = models.ForeignKey(Task, on_delete=models.CASCADE)
    uploadedby_id = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table = 'attatchment'

    def __str__(self):
        return self.file_name

class Comment(models.Model):
    text = models.CharField(max_length=150)
    task_id = models.ForeignKey(Task, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table = 'comment'

    def __str__(self):
        return self.text