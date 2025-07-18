from rest_framework import generics
from junoapi.serializers import TeamSerializer
from junoapi.models import Team
from junoapi.selectors import get_teams

class GetTeamsView(generics.ListCreateAPIView):
    serializer_class = TeamSerializer

    def get_queryset(self):
        return get_teams(self)