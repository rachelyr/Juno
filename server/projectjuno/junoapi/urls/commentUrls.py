from django.urls import path

from junoapi.views.CommentViews import ListCreateCommentView, DeleteCommentView

urlpatterns = [
    path('comments/', ListCreateCommentView.as_view(), name='list-create-comment'),
    path('comments/<int:pk>/', DeleteCommentView.as_view(), name='delete-comment'),
]