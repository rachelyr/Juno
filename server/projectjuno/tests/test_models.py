import pytest
from django.contrib.auth import get_user_model
from junoapi.models import Team, Project, Task, ProjectTeam, Comment
import uuid
from datetime import timedelta
from django.utils import timezone

User = get_user_model()

@pytest.fixture
def test_user(db):
    return User.objects.create_user(
        username='test-user',
        cognito_id=str(uuid.uuid4()),
        password='testpass123'
    )

#Testing - Team Model
@pytest.mark.django_db
def test_team_str_representation():
    user = User.objects.create_user(username="owner",cognito_id='test-id-5',password='testpass123')
    team = Team.objects.create(domain_name='Test Team',productowner_userid=user)
    assert str(team) == 'Test Team'  

@pytest.mark.django_db
def test_team_relations():
    owner = User.objects.create_user(username='owner',cognito_id='test-id-1', password='testpass123')
    manager = User.objects.create_user(username='manager',cognito_id='test-id-2',password='testpass123')
    member1 = User.objects.create_user(username='member1',cognito_id='test-id-3',password='testpass123')
    member2 = User.objects.create_user(username='member2',cognito_id='test-id-4',password='testpass123')

    team = Team.objects.create(
        domain_name='team test',
        productowner_userid=owner,
        projectmanager_userid=manager
    )
    team.members.add(member1, member2)

    assert team.productowner_userid == owner
    assert team.projectmanager_userid == manager
    assert team.members.count() == 2
    assert {u.username for u in team.members.all()} == {'member1', 'member2'}

#testing Task Model
@pytest.fixture
def project(test_user):
    return Project.objects.create(
        name="Test Project",
        description="desc",
        start_date=timezone.now(),
        due_date=timezone.now() + timedelta(days=7),
        owner_id=test_user
    )

@pytest.fixture
def author_user():
    return User.objects.create_user(
        username=f"taskAuthor_{uuid.uuid4()}",
        cognito_id=str(uuid.uuid4()),
        password='testuser123'
        )

@pytest.fixture
def task(project,author_user):
    assigned_user = User.objects.create_user(username='taskAssignee',cognito_id=str(uuid.uuid4()),password='testuser123')

    return Task.objects.create(
        title="Task 1",
        description='test task',
        status='To Do',
        priority='High',
        tags='backend',
        start_date=timezone.now(),
        due_date=timezone.now() + timedelta(days=3),
        points=5,
        project_id=project,
        author_userid=author_user,
        assigned_userid=assigned_user
    )

@pytest.mark.django_db
def test_task_creation(project,author_user):
    assigned_user = User.objects.create_user(username='taskAssignee',cognito_id=str(uuid.uuid4()),password='testuser123')

    task = Task.objects.create(
        title="Task 1",
        description='test task',
        status='To Do',
        priority='High',
        tags='backend',
        start_date=timezone.now(),
        due_date=timezone.now() + timedelta(days=3),
        points=5,
        project_id=project,
        author_userid=author_user,
        assigned_userid=assigned_user
    )
    assert task.title == "Task 1"
    assert task.project_id == project
    assert task.author_userid == author_user
    assert task.assigned_userid == assigned_user


@pytest.mark.django_db
def test_task_without_assignee(project,test_user):
    task = Task.objects.create(
        title="Unassigned Task",
        description="Pending assignment",
        status="open",
        priority="low",
        start_date=timezone.now(),
        project_id=project,
        author_userid=test_user
    )
    assert task.assigned_userid is None

@pytest.mark.django_db
def test_cascade_delete_project(task,project):
    project.delete()
    assert Task.objects.count() == 0

@pytest.mark.django_db
def test_cascade_delete_author(author_user, task):
    author_user.delete()
    assert Task.objects.count() == 0

#Testing ProjectTeam model
@pytest.fixture
def team(test_user):
    return Team.objects.create(
        domain_name="Test team",
        productowner_userid=test_user
    )

@pytest.mark.django_db
def test_project_team_creation(project, team):
    relation = ProjectTeam.objects.create(project_id=project, team_id=team)

    assert relation.project_id == project
    assert relation.team_id == team
    assert ProjectTeam.objects.count() == 1

@pytest.mark.django_db
@pytest.mark.parametrize("delete_model",["project","team"])
def test_project_team_cascade(delete_model, project, team):
    ProjectTeam.objects.create(project_id=project, team_id=team)

    if delete_model == "project":
        project.delete()
        lookup = {"project_id": project.id}
    else:
        team.delete()
        lookup= {"team_id":team.id}

    assert not ProjectTeam.objects.filter(**lookup).exists()

#Testing - Comment Modal
@pytest.fixture
def comment(test_user, task):
    return Comment.objects.create(
        text="Test comment by user",
        task_id=task,
        user_id=test_user
    )

@pytest.mark.django_db
def test_comment_creation(task, test_user):
    comment = Comment.objects.create(
        text="Test comment by user",
        task_id=task,
        user_id=test_user
        )
    
    assert Comment.objects.count() == 1
    assert comment.user_id == test_user
    assert comment.task_id == task

@pytest.mark.django_db
@pytest.mark.parametrize("delete_model",["task", "test_user"])
def test_comment_cascade(comment,delete_model, task, test_user):
    if delete_model == "task":
        task.delete()
        lookup = {"task_id":task.id}
    else:
        test_user.delete()
        lookup = {"user_id":test_user.id}
    
    assert Comment.objects.filter(**lookup).exists