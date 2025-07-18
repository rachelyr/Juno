from django.urls import path

from junoapi.views.AttachmentViews import CreateAttachView, UpdateAttachView

urlpatterns = [
    path('attachments/', CreateAttachView.as_view()),
    path('attachments/<int:pk>/', UpdateAttachView.as_view()),
]