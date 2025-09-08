import pytest
from rest_framework.test import APIClient
from rest_framework import status
import uuid
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta

from junoapi.models import Comment, Task, Project

User = get_user_model()

@pytest.mark.django_db
class TestListCreateCommentView:
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser2",
            cognito_id=str(uuid.uuid4()),
            password="testuser123"
        )
        self.client.force_authenticate(user=self.user)

        self.project = Project.objects.create(
            name="Test Project",
            description="desc",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=5),
            owner_id=self.user
        )
        self.task = Task.objects.create(
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
        self.url = reverse('list-create-comment', args=[self.task.id])

    def test_list_comment_successful(self):
        Comment.objects.create(
            text="My Comment",
            task_id=self.task,
            user_id=self.user
        )
        response = self.client.get(self.url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["text"] == "My Comment"

    def test_unauth_list_comment(self):
        self.client.force_authenticate(user=None)
        Comment.objects.create(
            text="My Comment",
            task_id=self.task,
            user_id=self.user
        )
        response = self.client.get(self.url)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_comment_successful(self):
        payload = {"text": "New Comment"}
        response = self.client.post(self.url, payload, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert Comment.objects.filter(text="New Comment", task_id=self.task).exists()

    def test_create_invalid_comment(self):
        self.url = reverse('list-create-comment', args=[999])
        payload = {"text": "New Comment"}
        response = self.client.post(self.url, payload, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data
        assert response.data["error"] == "Provide valid task ID"

@pytest.mark.django_db
class TestDeleteCommentView:
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser2",
            cognito_id=str(uuid.uuid4()),
            password="testuser123"
        )
        self.client.force_authenticate(user=self.user)

        self.project = Project.objects.create(
            name="Test Project",
            description="desc",
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=5),
            owner_id=self.user
        )
        self.task = Task.objects.create(
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
        self.comment = Comment(
            text="Test Comment",
            user_id = self.user,
            task_id = self.task
        )
        self.comment.save()
        self.url = reverse('delete-comment', args=[self.task.id, self.comment.id])

    def test_delete_comment_successful(self):
        response = self.client.delete(self.url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Comment.objects.filter(id=self.comment.id).exists()

    def test_unauth_user_delete_comment(self):
        self.client.force_authenticate(user=None)
        response = self.client.delete(self.url)

        assert response.status_code == status.HTTP_403_FORBIDDEN