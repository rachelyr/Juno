from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.exceptions import ValidationError

from junoapi.models import Comment, Task, User
from junoapi.serializers import CommentSerializer
from junoapi.permissions import IsAdminOrCommentOwner

class ListCreateCommentView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        return Comment.objects.filter(task_id=task_id)

    def perform_create(self, serializer):
        task_id = self.kwargs.get('task_id')

        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            raise ValidationError({"error": "Provide valid task ID"})
        
        user = self.request.user

        serializer.save(
            task_id = task,
            user_id = user
        )

class DeleteCommentView(generics.DestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsAdminOrCommentOwner]