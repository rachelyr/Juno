from django.urls import path

from junoapi.views.UserViews import GetUserView, CreateUserView, GetUserById

urlpatterns = [
    path('', GetUserView.as_view()),
    path('create-user', CreateUserView.as_view()),
    path('create-user/<str:cognito_id>', GetUserById.as_view())
]