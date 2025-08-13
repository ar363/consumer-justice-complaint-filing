from django.urls import path, include
from . import views

urlpatterns = [
    path("user/register-complaint.php", views.register_complaint, name="register_complaint")
]
