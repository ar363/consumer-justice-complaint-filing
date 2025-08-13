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
                    
                    // Scroll to checkbox if needed
                    this.scrollToElement(checkbox);
                    await this.delay(300);
                    
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
        
        // Scroll to the element if it's out of view
        this.scrollToElement(element);
        
        // Wait a moment for scroll to complete
        await this.delay(300);
        
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
            // For text inputs and textareas, type with dynamic speed based on content length
            element.value = '';
            element.focus();
            
            // Calculate dynamic typing speed
            const idealFillTime = 400; // Ideal 0.4 seconds for normal fields
            const maxFillTime = 1500; // Maximum 1.5 seconds for large text
            const minTypingSpeed = 10; // Minimum delay between characters (ms)
            const maxTypingSpeed = 100; // Maximum delay between characters (ms)
            
            // Calculate speed based on content length, starting with ideal time
            let targetTime = idealFillTime;
            
            // If the content would take longer than ideal time at reasonable speed,
            // gradually increase target time up to maximum
            if (value.length > (idealFillTime / minTypingSpeed)) {
                targetTime = Math.min(maxFillTime, value.length * minTypingSpeed);
            }
            
            let dynamicSpeed = targetTime / value.length;
            
            // Clamp the speed within reasonable bounds
            dynamicSpeed = Math.max(minTypingSpeed, Math.min(maxTypingSpeed, dynamicSpeed));
            
            for (let i = 0; i < value.length; i++) {
                element.value += value[i];
                element.dispatchEvent(new Event('input'));
                await this.delay(dynamicSpeed);
            }
        }
        
        // Remove highlight after a moment
        setTimeout(() => this.removeHighlight(element), 1000);
    }
    
    // Scroll to element if it's out of view
    scrollToElement(element) {
        // Check if element is in viewport
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const headerHeight = 100; // Account for fixed header
        
        // Element is out of view if:
        // - Top is above viewport (considering header)
        // - Bottom is below viewport
        const isOutOfView = rect.top < headerHeight || rect.bottom > viewportHeight;
        
        if (isOutOfView) {
            // Calculate scroll position to center the element in viewport
            const elementTop = element.offsetTop;
            const elementHeight = element.offsetHeight;
            const scrollTop = elementTop - (viewportHeight / 2) + (elementHeight / 2);
            
            // Smooth scroll to the element
            window.scrollTo({
                top: Math.max(0, scrollTop),
                behavior: 'smooth'
            });
        }
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
            // Scroll to submit button if needed
            this.scrollToElement(submitButton);
            await this.delay(300);
            
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
