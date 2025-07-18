from rest_framework import generics

from junoapi.models import Attachment
from junoapi.serializers import AttachmentSerializer
from junoapi.models import Task, User

class CreateAttachView(generics.ListCreateAPIView):
    serializer_class = AttachmentSerializer

    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        return Attachment.objects.filter(task_id=task_id)

    def perform_create(self, serializer):
        task_id = self.kwargs.get('task_id')
        user_id = self.request.query_params.get('user_id')

        # Get the actual objects
        task = Task.objects.get(id=task_id)
        user = User.objects.get(id=user_id)

        serializer.save(
            task_id = task,
            #requires logged in user to be picked up - NEEDS UPDATE
            uploadedby_id = user
        )

class UpdateAttachView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer