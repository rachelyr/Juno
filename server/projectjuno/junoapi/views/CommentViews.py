from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from junoapi.models import Comment, Task, User
from junoapi.serializers import CommentSerializer

class CreateCommentView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        return Comment.objects.filter(task_id=task_id)

    def perform_create(self, serializer):
        task_id = self.kwargs.get('task_id')

        # Get the actual objects
        task = Task.objects.get(id=task_id)
        user = self.request.user

        serializer.save(
            task_id = task,
            user_id = user
        )

class DeleteCommentView(generics.DestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]