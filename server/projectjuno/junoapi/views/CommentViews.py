from rest_framework import generics

from junoapi.models import Comment, Task, User
from junoapi.serializers import CommentSerializer

class CreateCommentView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        return Comment.objects.filter(task_id=task_id)

    def perform_create(self, serializer):
        task_id = self.kwargs.get('task_id')
        user_id = self.request.query_params.get('user_id')

        # Get the actual objects
        task = Task.objects.get(id=task_id)
        user = User.objects.get(id=user_id)

        serializer.save(
            task_id = task,
            #requires logged in user to be picked up - NEEDS UPDATE
            user_id = user
        )

class DeleteCommentView(generics.DestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer