from django.urls import path
from junoapi.views.TeamViews import GetTeamsView

urlpatterns = [
    path('/', GetTeamsView.as_view()),
]