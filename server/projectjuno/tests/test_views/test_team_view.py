import pytest
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta
import uuid

from rest_framework.test import APIClient
from rest_framework import status

from junoapi.models import Team, Project, ProjectTeam

User = get_user_model()

@pytest.mark.django_db
class TestTeamListCreateView:
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser1",
            cognito_id=str(uuid.uuid4()),
            password="testuser123"
        )
        self.client.force_authenticate(user=self.user)

    def test_create_team(self):
        member = User.objects.create_user(
            username="testuser2",
            cognito_id=str(uuid.uuid4()),
            password="testuser123"
        )
        payload = {
            "domain_name": "Test Team",
            "productowner_userid": self.user.id,
            "projectmanager_userid": self.user.id,
            "members": [member.username]
        }
        url = reverse('list-create-team')
        reponse= self.client.post(url, payload, format='json')

        assert reponse.status_code == status.HTTP_201_CREATED
        data = reponse.json()
        assert data['domain_name'] == 'Test Team'
        assert any(m['id'] == member.id for m in data['members'])

    def test_list_related_only_team(self):
        user2 = User.objects.create_user(
            username="testuser3",
            cognito_id=str(uuid.uuid4()),
            password="testuser123"
        )

        team = Team.objects.create(
            domain_name="user2 team",
            productowner_userid=user2,
            projectmanager_userid=user2
        )
        url = reverse('list-create-team')
        reponse = self.client.get(url)

        assert reponse.status_code == status.HTTP_200_OK
        data = reponse.json()
        #user1 has not created any teams
        assert len(data) == 0
        assert Team.objects.filter(id=team.id).exists()

    def test_create_team_with_invalid_member(self):
        payload ={
            "domain_name": "Team with invalid",
            "productowner_userid": self.user.id,
            "projectmanager_userid": self.user.id,
            "members": ["ghostuser"]
        }
        url = reverse('list-create-team')
        reponse = self.client.post(url, payload, format='json')

        assert reponse.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
class TestAddMemberView:
    def setup_method(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username="owner",
            cognito_id=str(uuid.uuid4()),
            password="testuser123"
        )
        self.member = User.objects.create_user(
            username="member",
            cognito_id=str(uuid.uuid4()),
            password="testuser123"
        )
        self.extra_user = User.objects.create_user(
            username="extra",
            cognito_id=str(uuid.uuid4()),
            password="testuser123"
        )

        self.team = Team.objects.create(domain_name="test team", productowner_userid=self.owner, projectmanager_userid=self.owner)
        self.team.members.add(self.member)
        self.url = f"/api/teams/{self.team.id}/members/"

    def test_add_valid_member(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.patch(self.url, {"members": ["member"]}, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "Members added successfully" in response.data["message"]
        assert "member" in [u["username"] for u in response.data["team"]["members"]]

    def test_add_invalid_username(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.patch(self.url, {"members": ["ghostuser", "member"]}, format="json")
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "User not found" in response.data['error']
        assert "ghostuser" in response.data["error"]

    def test_permission_denied_non_owner(self):
        self.client.force_authenticate(user=self.extra_user)
        response = self.client.patch(self.url, {"members": ["member"]}, format='json')
        response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
class TestDeleteTeamView:
    def setup_method(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username="owner", password="test123", cognito_id=str(uuid.uuid4())
        )
        self.not_owner = User.objects.create_user(
            username="user2", password="test123", cognito_id=str(uuid.uuid4())
        )
        self.team = Team.objects.create(
            domain_name="delete team test",
            productowner_userid=self.owner,
            projectmanager_userid=self.owner
        )
        self.url = reverse("delete-team", args=[self.team.id])
    
    def test_owner_can_delete_team(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.delete(self.url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Team.objects.filter(id=self.team.id).exists()

    def test_non_owner_cannot_delete_team(self):
        self.client.force_authenticate(user=self.not_owner)
        response = self.client.delete(self.url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert Team.objects.filter(id=self.team.id).exists()

@pytest.mark.django_db
class TestCreateTeamProjectView:
    def setup_method(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username="owner", password="test123", cognito_id=str(uuid.uuid4())
        )
        self.client.force_authenticate(user=self.owner)
        self.other_user = User.objects.create_user(
            username="otherUser", password="test123", cognito_id=str(uuid.uuid4())
        )
        self.team = Team.objects.create(
            domain_name="Test Team",
            productowner_userid=self.owner,
            projectmanager_userid=self.owner
        )
        self.project = Project.objects.create(
            name="Test Project",
            description="test",
            start_date=timezone.now(),
            due_date= timezone.now() + timedelta(days=5),
            owner_id=self.owner
        )

        self.url = reverse("attach-project-team", args=[self.team.id, self.project.id])

    def test_successful_attach(self):
        response = self.client.post(self.url)

        assert response.status_code == status.HTTP_201_CREATED
        assert ProjectTeam.objects.filter(team_id=self.team,project_id=self.project)
        assert response.data["team_id"] == self.team.id
        assert response.data["project_id"] == self.project.id

    def test_invalid_ids(self):
        url = reverse("attach-project-team", args=[999,999])
        response = self.client.post(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "Invalid team or project ID" in response.data["detail"]

    def test_non_owner_cannot_attach(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(self.url)

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert not ProjectTeam.objects.filter(team_id=self.team, project_id=self.project).exists()

@pytest.mark.django_db
class TestGetTeamProjectView:
    def setup_method(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username="owner", password="test123", cognito_id=str(uuid.uuid4())
        )
        self.client.force_authenticate(user=self.owner)
        self.other_user = User.objects.create_user(
            username="otherUser", password="test123", cognito_id=str(uuid.uuid4())
        )
        self.team = Team.objects.create(
            domain_name="Test Team",
            productowner_userid=self.owner,
            projectmanager_userid=self.owner
        )
        self.project = Project.objects.create(
            name="Test Project",
            description="test",
            start_date=timezone.now(),
            due_date= timezone.now() + timedelta(days=5),
            owner_id=self.owner
        )
        self.url = reverse('get-project-team')

    def test_auth_get_project_team(self):
        project_team = ProjectTeam.objects.create(team_id=self.team, project_id=self.project)
        response = self.client.get(self.url)

        assert response.status_code == status.HTTP_200_OK
        assert ProjectTeam.objects.filter(team_id=project_team.team_id, project_id=project_team.project_id).exists()

    def test_non_auth_get_project_team(self):
        self.client.force_authenticate(user=None)
        ProjectTeam.objects.create(team_id=self.team, project_id=self.project)
        response = self.client.get(self.url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
class TestDeleteTeamProject:
    def setup_method(self):
        self.client = APIClient()

        self.owner = User.objects.create_user(
            username="owner", password="test123", cognito_id=str(uuid.uuid4())
        )
        self.manager = User.objects.create_user(
            username="manager", password="test123", cognito_id=str(uuid.uuid4())
        )
        self.other_user = User.objects.create_user(
            username="other", password="test123", cognito_id=str(uuid.uuid4())
        )
        self.team = Team.objects.create(
            domain_name="Test Team",
            productowner_userid=self.owner,
            projectmanager_userid=self.manager,
        )

        self.project = Project.objects.create(
            name="Test Project",
            description="test",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=5),
            owner_id=self.owner,
        )
        self.project_team = ProjectTeam.objects.create(
            team_id=self.team, project_id=self.project
        )
        self.url = reverse("delete-project-team", args=[self.team.id, self.project.id])

    def test_successful_removal_by_owner(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.delete(self.url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not ProjectTeam.objects.filter(team_id=self.team, project_id=self.project).exists()

    def test_forbidden_for_other_users(self):
        self.client.force_authenticate(user=self.manager)
        response = self.client.delete(self.url)

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert ProjectTeam.objects.filter(team_id=self.team, project_id=self.project).exists()
        assert "Only the Product Owner can remove this project from the team." in response.data["detail"]

    def test_not_invalid_ids(self):
        self.client.force_authenticate(user=self.owner)
        url = reverse("delete-project-team", args=[999,999])
        
        with pytest.raises(ProjectTeam.DoesNotExist):
            self.client.delete(url)