import pytest
from junoapi.models import Team, Project
from junoapi.serializers import TeamSerializer, ProjectSerializer
import uuid
from rest_framework.test import APIRequestFactory
from django.contrib.auth import get_user_model
from django.utils import timezone


User = get_user_model()

@pytest.mark.django_db
def test_team_serializer():
    owner = User.objects.create_user(username="owner",cognito_id=str(uuid.uuid4()),password='testuser123')
    manager = User.objects.create_user(username="manager",cognito_id=str(uuid.uuid4()),password='testuser123')
    member1 = User.objects.create_user(username="m1",cognito_id=str(uuid.uuid4()),password='testuser123')
    member2 = User.objects.create_user(username="m2",cognito_id=str(uuid.uuid4()),password='testuser123')

    team = Team.objects.create(domain_name="backend team", productowner_userid=owner, projectmanager_userid=manager)
    team.members.add(member1, member2)

    serializer = TeamSerializer(team)
    data = serializer.data

    assert data["id"] == team.id
    assert data["domain_name"] == "backend team"

    assert data["product_owner_username"] == "owner"
    assert data["project_manager_username"] == "manager"

    assert isinstance(data["members"], list)
    assert len(data["members"]) == 2
    usernames = {m["username"] for m in data["members"]}
    assert usernames == {"m1","m2"}

@pytest.mark.django_db()
def test_project_serializer_create_owner():
    factory = APIRequestFactory()
    user = User.objects.create_user(
        username="test_user2",
        cognito_id=str(uuid.uuid4()),
        password="testpass123"
    )

    request = factory.post("api/projects/", {})
    request.user = user

    data = {
        "name": "AI Project",
        "description": "Backend test",
        "start_date": timezone.now(),
        "due_date": timezone.now() + timezone.timedelta(days=5)
    }

    serializer = ProjectSerializer(data=data, context={"request": request})
    assert serializer.is_valid(), serializer.errors

    project = serializer.save()

    assert project.owner_id == user
    assert Project.objects.filter(owner_id=user, name="AI Project").exists()