from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
import json

from .models import PendingFormRequest, Submission
from .serializers import PendingFormRequestSerializer, SubmissionSerializer, GrievanceDataSerializer


def register_complaint(request):
    if request.method == "POST":
        # Handle the form submission and save to Submission model
        form_data = {}
        for key in request.POST.keys():
            if key != 'csrfmiddlewaretoken':
                form_data[key] = request.POST.get(key)
        
        # Save submission
        submission = Submission.objects.create()
        submission.set_submission_data(form_data)
        submission.save()
        
        return JsonResponse({
            'status': 'success',
            'message': 'Grievance submitted successfully',
            'submission_id': submission.id
        })
    
    return render(request, "register_complaint.html")


class PendingFormRequestListCreateView(generics.ListCreateAPIView):
    """
    API endpoint to create new form fill requests and get pending requests
    """
    queryset = PendingFormRequest.objects.filter(is_processed=False)
    serializer_class = PendingFormRequestSerializer
    
    @extend_schema(
        summary="Create a new form fill request",
        description="Send grievance data to be auto-filled in the form",
        request=GrievanceDataSerializer,
        responses={201: PendingFormRequestSerializer}
    )
    def post(self, request, *args, **kwargs):
        serializer = GrievanceDataSerializer(data=request.data)
        if serializer.is_valid():
            # Create pending request
            pending_request = PendingFormRequest.objects.create()
            pending_request.set_grievance_data(serializer.validated_data)
            pending_request.save()
            
            # Prepare response data
            response_data = {
                'id': pending_request.id,
                'grievance_data': pending_request.get_grievance_data(),
                'is_processed': pending_request.is_processed,
                'created_at': pending_request.created_at
            }
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @extend_schema(
        summary="Get pending form fill requests",
        description="Retrieve all unprocessed form fill requests",
        responses={200: PendingFormRequestSerializer(many=True)}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


@api_view(['GET'])
@extend_schema(
    summary="Get the next pending form request",
    description="Get the oldest unprocessed form fill request for auto-filling",
    responses={200: PendingFormRequestSerializer, 404: {"type": "object", "properties": {"message": {"type": "string"}}}}
)
def get_next_pending_request(request):
    """Get the next pending request for form filling"""
    try:
        pending_request = PendingFormRequest.objects.filter(is_processed=False).first()
        if pending_request:
            response_data = {
                'id': pending_request.id,
                'grievance_data': pending_request.get_grievance_data(),
                'is_processed': pending_request.is_processed,
                'created_at': pending_request.created_at
            }
            return Response(response_data)
        else:
            return Response({'message': 'No pending requests'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@extend_schema(
    summary="Mark a request as processed",
    description="Mark a form fill request as processed after auto-filling is complete",
    request={"type": "object", "properties": {"request_id": {"type": "integer"}}},
    responses={200: {"type": "object", "properties": {"message": {"type": "string"}}}}
)
def mark_request_processed(request):
    """Mark a pending request as processed"""
    try:
        request_id = request.data.get('request_id')
        if not request_id:
            return Response({'error': 'request_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        pending_request = PendingFormRequest.objects.get(id=request_id, is_processed=False)
        pending_request.is_processed = True
        pending_request.processed_at = timezone.now()
        pending_request.save()
        
        return Response({'message': 'Request marked as processed'})
    except PendingFormRequest.DoesNotExist:
        return Response({'error': 'Request not found or already processed'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
