import pytest
import uuid

from django.utils import timezone
from django.urls import reverse
from datetime import timedelta
from django.contrib.auth import get_user_model

from junoapi.models import Task, Project
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()

@pytest.mark.django_db
class TestListCreateTaskView:
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", cognito_id=str(uuid.uuid4()), password="test123")
        self.client.force_authenticate(user=self.user)

        self.project = Project.objects.create(
            name="Test Project",
            description="desc",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=5),
            owner_id=self.user
        )
        self.task1 = Task.objects.create(
            title="Task 1",
            description="desc 1",
            status="To Do",
            priority="high",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=4),
            points=5,
            project_id=self.project,
            author_userid=self.user
        )
        self.task2 = Task.objects.create(
            title="Task 2",
            description="desc 2",
            status="Work In Progress",
            priority="medium",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=3),
            points=3,
            project_id=self.project,
            author_userid=self.user
        )

        self.url = reverse("create-list-tasks")

    def test_create_task_successful(self):
        payload = {
            "title": "New Task",
            "description": "New desc",
            "status": "Work In Progress",
            "priority": "High",
            "start_date": timezone.now(),
            "due_date": timezone.now() + timedelta(days=2),
            "points": 2,
            "project_id": self.project.id,
            "author_userid": self.user.id
        }
        response = self.client.post(self.url, payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert Task.objects.filter(title="New Task",project_id=self.project).exists()

    def test_list_tasks_successful(self):
        response = self.client.get(self.url, {"project_id": self.project.id})
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
        titles = [t['title'] for t in data]
        assert "Task 1" in titles
        assert "Task 2" in titles

    def test_list_tasks_no_project_id(self):
        response = self.client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)

    def test_create_invalid_task(self):
        payload = {
            "title": "",
            "project":self.project.id
        }
        response = self.client.post(self.url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_unauth_access(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url, {"project_id": self.project.id})
        assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
class TestUpdateTaskStatusView:
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", cognito_id=str(uuid.uuid4()), password="test123")
        self.client.force_authenticate(user=self.user)

        self.project = Project.objects.create(
            name="Test Project",
            description="desc",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=5),
            owner_id=self.user
        )
        self.task = Task.objects.create(
            title="Test Task",
            description="task desc",
            status="To Do",
            priority="High",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=4),
            points=5,
            project_id=self.project,
            author_userid=self.user
        )

        self.url = reverse("update-task-status", args=[self.task.pk])
    
    def test_update_task_status_successful(self):
        response = self.client.patch(self.url, {"status": "Under Review"}, format='json')

        assert response.status_code == status.HTTP_200_OK
        self.task.refresh_from_db()
        assert self.task.status == "Under Review"
    
    def test_unauth_update_task_status(self):
        self.client.force_authenticate(user=None)
        response = self.client.patch(self.url, {"status": "Completed"}, format='json')

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert not self.task.status == "Completed"
    
    def test_invalid_task_id(self):
        self.url = reverse('update-task-status', args=[999])
        response = self.client.patch(self.url, {"status": "Completed"}, format='json')

        assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.django_db
class TestGetUserTaskView:
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", cognito_id=str(uuid.uuid4()), password="test123")
        self.client.force_authenticate(user=self.user)

        self.project = Project.objects.create(
            name="Test Project",
            description="desc",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=5),
            owner_id=self.user
        )
        self.task = Task.objects.create(
            title="User Test Task",
            description="task desc",
            status="To Do",
            priority="High",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=4),
            points=5,
            project_id=self.project,
            author_userid=self.user,
            assigned_userid=self.user
        )

        self.url = reverse('get-user-tasks', args=[self.user.id])

    def test_get_user_task_successful(self):
        response = self.client.get(self.url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
    
    def test_get_invalid_user_task(self):
        self.url = reverse('get-user-tasks', args=[999])
        response = self.client.get(self.url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_get_unauth_user_task(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
class TestUpdateTaskView:
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", cognito_id=str(uuid.uuid4()), password="test123")
        self.other_user = User.objects.create_user(username="other user", cognito_id=str(uuid.uuid4()), password="test123")
        self.client.force_authenticate(user=self.user)

        self.project = Project.objects.create(
            name="Test Project",
            description="desc",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=5),
            owner_id=self.user
        )
        self.task = Task.objects.create(
            title="Test Task",
            description="task desc",
            status="To Do",
            priority="High",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=4),
            points=5,
            project_id=self.project,
            author_userid=self.user
        )

        self.url = f"/api/tasks/{self.task.id}/?project_id={self.project.id}"
    
    def test_update_task_successful(self):
        response = self.client.patch(self.url, {
            "priority": "Low",
            "assigned_userid": self.other_user.id
            }, format='json')

        self.task.refresh_from_db()
        assert response.status_code == status.HTTP_200_OK
        assert self.task.priority == "Low"
        assert self.task.assigned_userid == self.other_user
    
    def test_unauth_update_task(self):
        self.client.force_authenticate(user=None)
        response = self.client.patch(self.url, {
            "title": "New Task Title",
            "assigned_userid": self.other_user.id
            }, format='json')

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert not self.task.title == "New Task Title"
    
    def test_invalid_task_id(self):
        self.url = f"/api/tasks/999/?project_id={self.project.id}"
        response = self.client.patch(self.url, {
            "priority": "Low",
            "assigned_userid": self.other_user.id
            }, format='json')

        assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.django_db
class TestDeleteTaskView:
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", cognito_id=str(uuid.uuid4()), password="test123")
        self.other_user = User.objects.create_user(username="other user", cognito_id=str(uuid.uuid4()), password="test123")
        self.client.force_authenticate(user=self.user)

        self.project = Project.objects.create(
            name="Test Project",
            description="desc",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=5),
            owner_id=self.user
        )
        self.task = Task.objects.create(
            title="Test Task",
            description="task desc",
            status="To Do",
            priority="High",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=4),
            points=5,
            project_id=self.project,
            author_userid=self.user
        )

        self.url = reverse('delete-task', args=[self.task.pk])

    def test_delete_task_successful(self):
        response = self.client.delete(self.url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Task.objects.filter(id=self.task.id)
    
    def test_unauth_delete_task(self):
        self.client.force_authenticate(user=None)
        response = self.client.delete(self.url)

        assert response.status_code == status.HTTP_403_FORBIDDEN