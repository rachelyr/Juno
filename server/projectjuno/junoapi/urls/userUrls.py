from django.urls import path

from junoapi.views.UserViews import GetUserView

urlpatterns = [
    path('users/', GetUserView.as_view()),
]