from django.db import models
import json

class PendingFormRequest(models.Model):
    """Model to store pending form fill requests"""
    grievance_data = models.TextField()  # Store JSON as text
    is_processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Request {self.id} - {'Processed' if self.is_processed else 'Pending'}"
    
    def get_grievance_data(self):
        """Parse the JSON data"""
        try:
            return json.loads(self.grievance_data)
        except:
            return {}
    
    def set_grievance_data(self, data):
        """Set the JSON data"""
        self.grievance_data = json.dumps(data)

class Submission(models.Model):
    """Model to store completed grievance submissions"""
    submission_data = models.TextField()  # Store JSON as text
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"Submission {self.id} - {self.submitted_at.strftime('%Y-%m-%d %H:%M')}"
    
    def get_submission_data(self):
        """Parse the JSON data"""
        try:
            return json.loads(self.submission_data)
        except:
            return {}
    
    def set_submission_data(self, data):
        """Set the JSON data"""
        self.submission_data = json.dumps(data)
    
    def get_grievance_type(self):
        """Helper method to get grievance type from JSON data"""
        data = self.get_submission_data()
        return data.get('grievanceType', 'Unknown')
    
    def get_company(self):
        """Helper method to get company from JSON data"""
        data = self.get_submission_data()
        return data.get('company', 'Unknown')
