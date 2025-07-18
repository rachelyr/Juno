from rest_framework import generics
from junoapi.serializers import UserSerializer
from junoapi.models import User

class GetUserView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer