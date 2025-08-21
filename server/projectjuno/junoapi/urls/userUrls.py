from django.urls import path

from junoapi.views.UserViews import GetUserView, CreateUserView, GetUserById

urlpatterns = [
    path('', GetUserView.as_view()),
    path('create-user', CreateUserView.as_view()),
    path('<str:user_sub>', GetUserById.as_view())
]