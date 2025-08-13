from rest_framework import serializers
from .models import PendingFormRequest, Submission

class GrievanceDataSerializer(serializers.Serializer):
    """Serializer for grievance form data"""
    grievanceType = serializers.CharField(max_length=100)
    grievanceClassification = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    purchaseCity = serializers.CharField(max_length=100)
    sectorIndustry = serializers.CharField(max_length=100)
    category = serializers.CharField(max_length=100)
    company = serializers.CharField(max_length=100)
    natureOfGrievance = serializers.CharField(max_length=200)
    productValue = serializers.CharField(max_length=50)
    dealerInfo = serializers.CharField(max_length=500, required=False, allow_blank=True)
    grievanceDetails = serializers.CharField(max_length=1000)
    expectation = serializers.CharField(max_length=100)
    registeredWithCompany = serializers.CharField(max_length=10)
    declaration = serializers.BooleanField()

class PendingFormRequestSerializer(serializers.ModelSerializer):
    grievance_data = GrievanceDataSerializer()
    
    class Meta:
        model = PendingFormRequest
        fields = ['id', 'grievance_data', 'is_processed', 'created_at']
        read_only_fields = ['id', 'is_processed', 'created_at']

class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['id', 'submission_data', 'submitted_at']
        read_only_fields = ['id', 'submitted_at']
