from django.contrib import admin
from .models import PendingFormRequest, Submission
import json

@admin.register(PendingFormRequest)
class PendingFormRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'is_processed', 'created_at', 'processed_at', 'get_grievance_type']
    list_filter = ['is_processed', 'created_at']
    search_fields = ['grievance_data']
    readonly_fields = ['created_at', 'processed_at']
    
    def get_grievance_type(self, obj):
        data = obj.get_grievance_data()
        return data.get('grievanceType', 'Unknown')
    get_grievance_type.short_description = 'Grievance Type'

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['id', 'get_grievance_type', 'get_company', 'submitted_at']
    list_filter = ['submitted_at']
    search_fields = ['submission_data']
    readonly_fields = ['submitted_at']
    
    def get_grievance_type(self, obj):
        return obj.get_grievance_type()
    get_grievance_type.short_description = 'Grievance Type'
    
    def get_company(self, obj):
        return obj.get_company()
    get_company.short_description = 'Company'
