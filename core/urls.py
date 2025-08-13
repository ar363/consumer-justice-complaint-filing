from django.urls import path, include
from . import views

urlpatterns = [
    path("user/register-complaint.php", views.register_complaint, name="register_complaint"),
    
    # API endpoints
    path("api/form-requests/", views.PendingFormRequestListCreateView.as_view(), name="form_requests"),
    path("api/next-request/", views.get_next_pending_request, name="next_request"),
    path("api/mark-processed/", views.mark_request_processed, name="mark_processed"),
]
