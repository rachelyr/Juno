from django.urls import path

from junoapi.views.CommentViews import CreateCommentView, DeleteCommentView

urlpatterns = [
    path('comments/', CreateCommentView.as_view()),
    path('comments/<int:pk>/', DeleteCommentView.as_view()),
]