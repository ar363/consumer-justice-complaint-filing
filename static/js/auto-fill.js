// Auto-fill functionality for grievance form
class GrievanceFormAutoFiller {
    constructor() {
        this.isProcessing = false;
        this.currentRequest = null;
        this.typingSpeed = 50; // milliseconds between characters
        this.fieldDelay = 200; // delay between fields
        
        // Start checking for new requests
        this.startPolling();
    }
    
    // Start polling for new requests every 1 second
    startPolling() {
        setInterval(() => {
            if (!this.isProcessing) {
                this.checkForNewRequest();
            }
        }, 1000);
    }
    
    // Check API for new pending requests
    async checkForNewRequest() {
        try {
            const response = await fetch('/api/next-request/');
            
            if (response.ok) {
                const data = await response.json();
                if (data.id && !this.isProcessing) {
                    console.log('New request found:', data);
                    this.currentRequest = data;
                    await this.fillForm(data.grievance_data);
                }
            } else if (response.status === 404) {
                // No pending requests - this is normal
                console.log('No pending requests');
            }
        } catch (error) {
            console.error('Error checking for new requests:', error);
        }
    }
    
    // Fill the form with typing effect
    async fillForm(data) {
        this.isProcessing = true;
        console.log('Starting form fill with data:', data);
        
        try {
            // Define the order of fields to fill
            const fieldOrder = [
                'grievanceType',
                'grievanceClassification', 
                'state',
                'purchaseCity',
                'sectorIndustry',
                'category',
                'company',
                'natureOfGrievance',
                'productValue',
                'dealerInfo',
                'grievanceDetails',
                'expectation',
                'registeredWithCompany'
            ];
            
            // Fill each field with typing effect
            for (const fieldName of fieldOrder) {
                if (data[fieldName]) {
                    await this.fillField(fieldName, data[fieldName]);
                    await this.delay(this.fieldDelay);
                }
            }
            
            // Handle checkbox
            if (data.declaration) {
                const checkbox = document.querySelector('input[name="declaration"]');
                if (checkbox) {
                    await this.delay(this.fieldDelay);
                    this.highlightElement(checkbox.parentElement);
                    checkbox.click(); // Use click instead of setting checked directly
                    await this.delay(500);
                    this.removeHighlight(checkbox.parentElement);
                }
            }
            
            await this.delay(500);
            
            // Submit the form
            await this.submitForm();
            
            // Mark request as processed
            await this.markRequestProcessed();
            
        } catch (error) {
            console.error('Error filling form:', error);
        } finally {
            this.isProcessing = false;
        }
    }
    
    // Fill a specific field with typing effect
    async fillField(fieldName, value) {
        const element = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
        
        if (!element) {
            console.warn(`Field ${fieldName} not found`);
            return;
        }
        
        // Highlight the field
        this.highlightElement(element);
        
        if (element.tagName === 'SELECT') {
            // For select elements, find and select the option
            const option = Array.from(element.options).find(opt => 
                opt.value.toLowerCase() === value.toLowerCase() || 
                opt.text.toLowerCase() === value.toLowerCase()
            );
            if (option) {
                element.value = option.value;
                element.dispatchEvent(new Event('change'));
            }
        } else if (element.tagName === 'TEXTAREA' || element.type === 'text') {
            // For text inputs and textareas, type with effect
            element.value = '';
            element.focus();
            
            for (let i = 0; i < value.length; i++) {
                element.value += value[i];
                element.dispatchEvent(new Event('input'));
                await this.delay(this.typingSpeed);
            }
        }
        
        // Remove highlight after a moment
        setTimeout(() => this.removeHighlight(element), 1000);
    }
    
    // Highlight element to show it's being filled
    highlightElement(element) {
        element.style.transition = 'all 0.3s ease';
        element.style.backgroundColor = '#ffffcc';
        element.style.borderColor = '#ff9900';
        element.style.boxShadow = '0 0 10px rgba(255, 153, 0, 0.5)';
    }
    
    // Remove highlight from element
    removeHighlight(element) {
        element.style.backgroundColor = '';
        element.style.borderColor = '';
        element.style.boxShadow = '';
    }
    
    // Submit the form
    async submitForm() {
        console.log('Submitting form...');
        
        const form = document.getElementById('grievanceForm');
        const submitButton = document.querySelector('.submit-btn');
        
        if (submitButton) {
            // Focus on submit button without highlighting it yellow
            submitButton.focus();
            
            // Wait a moment for visual effect
            await this.delay(500);
            
            // Click submit button
            submitButton.click();
            
            // Or submit form programmatically if needed
            // form.submit();
        }
    }
    
    // Mark the current request as processed
    async markRequestProcessed() {
        if (!this.currentRequest) return;
        
        try {
            const response = await fetch('/api/mark-processed/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken(),
                },
                body: JSON.stringify({
                    request_id: this.currentRequest.id
                })
            });
            
            if (response.ok) {
                console.log('Request marked as processed');
            } else {
                console.error('Failed to mark request as processed');
            }
        } catch (error) {
            console.error('Error marking request as processed:', error);
        }
        
        this.currentRequest = null;
    }
    
    // Get CSRF token for Django
    getCSRFToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]');
        return token ? token.value : '';
    }
    
    // Utility function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the auto-filler when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Grievance Form Auto Filler');
    window.grievanceAutoFiller = new GrievanceFormAutoFiller();
});

// Debug functions for testing
window.testAutoFill = function() {
    const testData = {
        grievanceType: 'complaint',
        grievanceClassification: 'product_quality',
        state: 'MAHARASHTRA',
        purchaseCity: 'Mumbai',
        sectorIndustry: 'Electronics Products',
        category: 'Mobile Phone',
        company: 'Test Company Ltd',
        natureOfGrievance: 'Product defect issue',
        productValue: '10000_50000',
        dealerInfo: 'Test Dealer\n123 Test Street\ntest@dealer.com\n9876543210',
        grievanceDetails: 'The product stopped working within warranty period. Customer service was unhelpful.',
        expectation: 'replacement',
        registeredWithCompany: 'yes',
        declaration: true
    };
    
    if (window.grievanceAutoFiller) {
        window.grievanceAutoFiller.fillForm(testData);
    }
};
