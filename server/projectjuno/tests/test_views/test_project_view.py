import pytest
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta
import uuid

from rest_framework.test import APIClient
from rest_framework import status

from junoapi.models import Project, Team, ProjectTeam

User = get_user_model()

@pytest.fixture
def user(db):
    return User.objects.create_user(
        username='testUser1',
        cognito_id=str(uuid.uuid4()),
        password="testpass123"
    )

@pytest.mark.django_db
class TestProjectView:
    #Without this, one test could “leak” its data or authentication into another
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser2",
            cognito_id=str(uuid.uuid4()),
            password="testuser123"
        )
        self.client.force_authenticate(user=self.user)

    def test_get_owned_projects(self):
        project = Project.objects.create(
            name="My Project",
            description="desc",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=5),
            owner_id=self.user,
        )

        url = reverse("project-list")
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data[0]["id"] == project.id

    def test_get_team_project(self):
        member = self.user
        project = Project.objects.create(
            name="Other Project",
            description="desc",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=5),
            owner_id=member
        )
        team = Team.objects.create(domain_name="test team",productowner_userid=member, projectmanager_userid=member)
        ProjectTeam.objects.create(project_id=project, team_id=team)

        url = reverse('project-list')
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        project_ids = [p["id"] for p in response.data]
        assert project.id in project_ids

    def test_cannot_get_unrelated_projects(self):
        other = User.objects.create_user(
            username="other",
            cognito_id=str(uuid.uuid4()),
            password="testuser123"
        )
        project = Project.objects.create(
            name="Other Project",
            description="desc",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=5),
            owner_id=other
        )

        url = reverse("project-list")
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        project_ids = [p["id"] for p in response.data]
        assert project.id not in project_ids

    def test_auth_users_create_project(self):
        url = reverse("project-list")
        data = {
            "name": "New Project",
            "description": "desc",
            "start_date": timezone.now(),
            "due_date": timezone.now() + timedelta(days=5),
        }
        response = self.client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        project = Project.objects.get(id=response.data["id"])
        assert project.owner_id == self.user

    def test_unauth_user_create_project(self):
        self.client.force_authenticate(user=None)
        url = reverse("project-list")
        data = {
            "name": "Blocked Project",
            "description": "desc",
            "start_date": timezone.now(),
            "due_date": timezone.now() + timedelta(days=5)
        }
        response = self.client.post(url, data, format="json")

        assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
class TestGetUserProjects:
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser6",
            cognito_id=str(uuid.uuid4()),
            password="testuser123"
        )
        self.client.force_authenticate(user=self.user)

    def test_user_with_no_projects(self):
        user = self.user
        self.client.force_authenticate(user=user)

        url = reverse("user-projects")
        reponse = self.client.get(url)

        assert reponse.status_code == status.HTTP_200_OK
        assert len(reponse.data) == 0

    def test_multiple_users_isolation(self):
        user1 = User.objects.create_user(
            username="testuser3",
            cognito_id=str(uuid.uuid4()),
            password="testuser123"
        )
        user2 = User.objects.create_user(
            username="testuser4",
            cognito_id=str(uuid.uuid4()),
            password="testuser123"
        )

        Project.objects.create(
            name="u1 project1",
            description="desc",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=5),
            owner_id=user1
        )
        Project.objects.create(
            name="u2 project1",
            description="desc",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=5),
            owner_id=user2
        )

        url = reverse("user-projects")
        self.client.force_authenticate(user=user1)
        response= self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        project_name = [p["name"] for p in response.data]
        assert set(project_name) == {"u1 project1"}

        #user2 projects
        self.client.force_authenticate(user=user2)
        response= self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        project_name = [p["name"] for p in response.data]
        assert set(project_name) == {"u2 project1"}

@pytest.mark.django_db
class TestDeleteProject:
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser6",
            cognito_id=str(uuid.uuid4()),
            password="testuser123"
        )
        self.client.force_authenticate(user=self.user)

    def test_owner_delete(self):
        user=self.user
        project = Project.objects.create(
            name="test project",
            description="test project desc",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=5),
            owner_id=user
        )

        url = reverse("delete-project", args=[project.id])
        reponse = self.client.delete(url)

        assert reponse.status_code == status.HTTP_204_NO_CONTENT
        assert not Project.objects.filter(id=project.id).exists()

    def test_user_cannot_delete_others_project(self):
        owner = User.objects.create_user(
            username="testuser8",
            cognito_id=str(uuid.uuid4()),
            password="testuser123"
        )
        project = Project.objects.create(
            name="test project",
            description="test project desc",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=5),
            owner_id=owner
        )
        self.client.force_authenticate(user=self.user)
        url = reverse('delete-project', args=[project.id])
        response = self.client.delete(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert Project.objects.filter(id=project.id).exists()