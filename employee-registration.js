// Modal Functions
function openEmployeeModal() {
    const modal = document.getElementById('employeeModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeEmployeeModal() {
    const modal = document.getElementById('employeeModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    resetForm();
}

// Job Role Toggle
function toggleJobRoleFields() {
    const onroleRadio = document.querySelector('input[name="jobrole"][value="onrole"]');
    const internRadio = document.querySelector('input[name="jobrole"][value="intern"]');
    const onroleArea = document.getElementById('onrole-area');
    const internArea = document.getElementById('intern-area');

    if (onroleRadio.checked) {
        onroleArea.classList.remove('hidden');
        internArea.classList.add('hidden');
    } else if (internRadio.checked) {
        onroleArea.classList.add('hidden');
        internArea.classList.remove('hidden');
    }
}

// Calculate intern duration
function calculateDuration() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) {
            alert('End date cannot be before start date');
            document.getElementById('end-date').value = '';
            return;
        }
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const months = Math.round(diffDays / 30.44);
        document.getElementById('duration').value = months + ' months';
    }
}

// Password toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}

// CONSOLIDATED FORM SUBMISSION FUNCTION
function handleFormSubmit(event) {
    event.preventDefault();
    
    console.log('Form submission started');
    
    // Validate passwords match
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Basic field validation
    const requiredFields = ['employee-id-reg', 'employee-name-reg', 'email-personal'];
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            alert(`Please fill in the ${field.previousElementSibling?.textContent || fieldId} field`);
            field.focus();
            return;
        }
    }

    const form = document.getElementById('employeeForm');
    const formData = new FormData(form);
 
    const jobRole = document.querySelector('input[name="jobrole"]:checked')?.value || '';
    let dateOfBirth = '';
 
    if (jobRole === 'onrole') {
        const dobInput = document.getElementById('dob-onrole');
        if (dobInput) dateOfBirth = dobInput.value.trim();
    } else if (jobRole === 'intern') {
        const dobInput = document.getElementById('dob-intern');
        if (dobInput) dateOfBirth = dobInput.value.trim();
    }
 
    // Only append if value exists (optional)
    if (dateOfBirth) {
        formData.set('date_of_birth', dateOfBirth);  // Using set() to overwrite if key already exists
    }

    
    // Debug: Log all form data
    console.log('Form data being sent:');
    for (let [key, value] of formData.entries()) {
        console.log(key + ': ' + value);
    }
    
    // Show loading indicator
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    submitBtn.disabled = true;
    
    // Enhanced fetch with better error handling
    fetch('https://www.fist-o.com/web_crm/registration.php', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('debug:', response);
        
        // Handle different status codes
        if (response.status === 405) {
            throw new Error('Method Not Allowed - Server configuration issue');
        } else if (response.status === 404) {
            throw new Error('Registration script not found');
        } else if (response.status === 500) {
            throw new Error('Server internal error');
        } else if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.text();
    })
    .then(text => {
        console.log('Raw response:', text);
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        try {
            const data = JSON.parse(text);
            console.log('Parsed data:', data);
            
            if (data.status === 'success') {
                // Show success message
                if (typeof employeeManager !== 'undefined' && employeeManager.showToast) {
                    employeeManager.showToast('Success!', 'Employee registered successfully', 'success');
                } else {
                    alert('Employee registered successfully!');
                }
                
                // Reset form and close modal
                form.reset();
                resetForm();
                closeEmployeeModal();
                
                // Refresh the table if using the manager
                if (typeof employeeManager !== 'undefined' && employeeManager.refreshFromDatabase) {
                    employeeManager.refreshFromDatabase();
                }
            } else {
                // Show error message
                const errorMsg = data.message || 'Registration failed';
                if (typeof employeeManager !== 'undefined' && employeeManager.showToast) {
                    employeeManager.showToast('Error', errorMsg, 'error');
                } else {
                    alert('Error: ' + errorMsg);
                }
                
                if (data.debug) {
                    console.log('Debug info:', data.debug);
                }
            }
        } catch (e) {
            console.error('JSON parse error:', e);
            console.log('Response was not valid JSON:', text);
            
            // Check if response looks like HTML (server error page)
            if (text.includes('<html>') || text.includes('<body>') || text.includes('Fatal error')) {
                alert('Server error occurred. Please check the console for details.');
                console.error('Server error response:', text);
            } else {
                alert('Server returned response: ' + text.substring(0, 100));
            }
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Show specific error messages
        let errorMessage = 'An error occurred during registration.';
        
        if (error.message.includes('Method Not Allowed')) {
            errorMessage = 'Server configuration error: The server is not accepting POST requests.';
        } else if (error.message.includes('not found')) {
            errorMessage = 'Registration script not found. Please check the URL.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Network error: Unable to connect to server. Check your connection.';
        } else {
            errorMessage = error.message;
        }
        
        if (typeof employeeManager !== 'undefined' && employeeManager.showToast) {
            employeeManager.showToast('Network Error', errorMessage, 'error');
        } else {
            alert('Error: ' + errorMessage);
        }
    });
}

// Reset form
function resetForm() {
    document.getElementById('employeeForm').reset();
    document.getElementById('onrole-area').classList.add('hidden');
    document.getElementById('intern-area').classList.add('hidden');
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('employeeModal');
    if (event.target === modal) {
        closeEmployeeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeEmployeeModal();
    }
});

// Improved Employee Manager with better CORS and error handling
class ImprovedEmployeeManager {
    constructor() {
        this.employees = [];
        this.filteredEmployees = [];
        this.searchTerm = '';
        this.jobRoleFilter = '';
        this.workingStatusFilter = '';
        
        // API endpoints
        this.baseURL = 'https://www.fist-o.com/web_crm/';
        this.endpoints = {
            fetch: this.baseURL + 'fetch_employees.php',
            delete: this.baseURL + 'delete_employee.php',
            register: this.baseURL + 'registration.php'
        };
        
        // Retry configuration
        this.maxRetries = 3;
        this.retryDelay = 1000;
        
        this.initializeEventListeners();
        this.loadEmployees();
        
        // Auto-refresh every 60 seconds (reduced frequency to avoid CORS issues)
        setInterval(() => this.loadEmployees(false), 60000);
    }

    initializeEventListeners() {
        // Search functionality with debouncing
        const searchInput = document.getElementById('searchInput') || document.querySelector('input[type="search"]');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchTerm = e.target.value;
                    this.applyFilters();
                }, 500); // Increased debounce delay
            });
        }

        // Filter functionality
        const jobRoleFilter = document.getElementById('jobRoleFilter');
        if (jobRoleFilter) {
            jobRoleFilter.addEventListener('change', (e) => {
                this.jobRoleFilter = e.target.value;
                this.applyFilters();
            });
        }

        const workingStatusFilter = document.getElementById('workingStatusFilter');
        if (workingStatusFilter) {
            workingStatusFilter.addEventListener('change', (e) => {
                this.workingStatusFilter = e.target.value;
                this.applyFilters();
            });
        }
    }

    // Improved fetch with retry mechanism
    async fetchWithRetry(url, options = {}, retries = 0) {
        try {
            console.log(`Attempting to fetch from: ${url} (attempt ${retries + 1})`);
            
            // Simplified fetch options to avoid CORS issues
            const fetchOptions = {
                method: 'GET',
                mode: 'cors', // Explicitly set CORS mode
                credentials: 'omit', // Don't send credentials
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                ...options
            };

            const response = await fetch(url, fetchOptions);
            
            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
            
        } catch (error) {
            console.error(`Fetch attempt ${retries + 1} failed:`, error);
            
            if (retries < this.maxRetries) {
                console.log(`Retrying in ${this.retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.fetchWithRetry(url, options, retries + 1);
            }
            
            throw error;
        }
    }

    async loadEmployees(showLoading = true) {
        const tbody = document.getElementById('employeeTableBody');
        
        if (showLoading && tbody) {
            this.showLoading();
        }

        try {
            console.log('Loading employees from database...');
            
            const response = await this.fetchWithRetry(this.endpoints.fetch);
            const text = await response.text();
            
            console.log('Raw response (first 200 chars):', text.substring(0, 200));

            let result;
            try {
                result = JSON.parse(text);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                console.error('Full response text:', text);
                
                // Check if response looks like an error page
                if (text.includes('<html>') || text.includes('<body>') || text.includes('<!DOCTYPE')) {
                    throw new Error('Server returned HTML instead of JSON. This might be a server error or redirect.');
                } else {
                    throw new Error('Invalid JSON response from server');
                }
            }
            
            if (result.status === 'success') {
                this.employees = result.data || [];
                this.applyFilters();
                
                console.log(`Successfully loaded ${this.employees.length} employees`);
                
                if (showLoading) {
                    this.showToast('Success', `Loaded ${this.employees.length} employees`, 'success');
                }
                
                this.updateStats();
                
            } else {
                throw new Error(result.message || 'Failed to load employees');
            }

        } catch (error) {
            console.error('Error loading employees:', error);
            
            let errorMessage = 'Unknown error occurred';
            
            if (error.message.includes('CORS')) {
                errorMessage = 'CORS policy error. The server needs to allow cross-origin requests.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error. Please check your internet connection and try again.';
            } else if (error.message.includes('HTML instead of JSON')) {
                errorMessage = 'Server configuration error. The PHP script might not be accessible.';
            } else {
                errorMessage = error.message;
            }
            
            this.showError(errorMessage);
            
            if (showLoading) {
                this.showToast('Error', 'Failed to load employees', 'error');
            }
        }
    }

    applyFilters() {
        this.filteredEmployees = this.employees.filter(employee => {
            const matchesSearch = !this.searchTerm || 
                (employee.emp_id && employee.emp_id.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
                (employee.emp_name && employee.emp_name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
                (employee.personal_email && employee.personal_email.toLowerCase().includes(this.searchTerm.toLowerCase()));

            const matchesJobRole = !this.jobRoleFilter || employee.job_role === this.jobRoleFilter;
            const matchesWorkingStatus = !this.workingStatusFilter || employee.working_status === this.workingStatusFilter;

            return matchesSearch && matchesJobRole && matchesWorkingStatus;
        });

        this.renderTable();
    }

    renderTable() {
        const tbody = document.getElementById('employeeTableBody');
        
        if (!tbody) {
            console.warn('Employee table body not found');
            return;
        }
        
        if (this.filteredEmployees.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                        <div class="empty-content">
                            <i class="fas fa-users" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                            <p style="font-size: 18px; margin: 0 0 8px 0;">
                                ${this.employees.length === 0 ? 'No employees found in database' : 'No employees match your search criteria'}
                            </p>
                            <small style="color: #999;">
                                ${this.employees.length === 0 ? 'Click "Add/Edit Employee" to get started' : 'Try adjusting your search or filters'}
                            </small>
                        </div>
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = this.filteredEmployees.map((employee, index) => {
            const empId = employee.emp_id || 'N/A';
            const empName = employee.emp_name || 'N/A';
            const designation = this.getDesignationText(employee.designation);
            const jobRole = employee.job_role || 'N/A';
            const workingStatus = employee.working_status || 'N/A';
            const email = employee.personal_email || 'N/A';
            const phone = employee.personal_number || 'N/A';
            
            return `
                <tr data-employee-index="${index}" style="transition: all 0.2s ease;" 
                    onmouseenter="this.style.backgroundColor='#f1f5f9'; this.style.transform='scale(1.01)'"
                    onmouseleave="this.style.backgroundColor=''; this.style.transform=''">
                    <td><strong style="color: #4f46e5;">${empId}</strong></td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #7c3aed); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
                                ${empName.charAt(0).toUpperCase()}
                            </div>
                            <span>${empName}</span>
                        </div>
                    </td>
                    <td><span style="color: #374151;">${designation}</span></td>
                    <td>
                        <span class="badge" style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: capitalize; ${this.getBadgeStyle(jobRole)}">
                            ${jobRole}
                        </span>
                    </td>
                    <td>
                        <span class="working-status" style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; ${this.getStatusStyle(workingStatus)}">
                            ${workingStatus}
                        </span>
                    </td>
                    <td style="color: #64748b;">
                        <a href="mailto:${email}" style="color: inherit; text-decoration: none;">
                            <i class="fas fa-envelope" style="margin-right: 6px; color: #4f46e5;"></i>
                            ${email}
                        </a>
                    </td>
                    <td style="color: #64748b;">
                        <a href="tel:${phone}" style="color: inherit; text-decoration: none;">
                            <i class="fas fa-phone" style="margin-right: 6px; color: #4f46e5;"></i>
                            ${phone}
                        </a>
                    </td>
                    <td>
                        <div style="display: flex; gap: 6px;">
                            <button onclick="window.employeeManager.viewEmployee(${index})" 
                                    title="View Employee Details"
                                    style="padding: 6px 10px; border: none; border-radius: 6px; background: #3b82f6; color: white; cursor: pointer; font-size: 12px; transition: all 0.2s ease;"
                                    onmouseenter="this.style.transform='scale(1.1)'"
                                    onmouseleave="this.style.transform='scale(1)'">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Test connection method
    async testConnection() {
        try {
            console.log('Testing connection to:', this.endpoints.fetch);
            
            const response = await this.fetchWithRetry(this.endpoints.fetch);
            const result = await response.json();
            
            console.log('Connection test result:', result);
            this.showToast('Connection Test', 'Successfully connected to database', 'success');
            
            return true;
        } catch (error) {
            console.error('Connection test failed:', error);
            this.showToast('Connection Test Failed', error.message, 'error');
            
            return false;
        }
    }

    getBadgeStyle(jobRole) {
        const styles = {
            'onrole': 'background: #dcfce7; color: #166534;',
            'intern': 'background: #fef3c7; color: #92400e;',
            'default': 'background: #e5e7eb; color: #374151;'
        };
        return styles[jobRole.toLowerCase()] || styles.default;
    }

    getStatusStyle(status) {
        const styles = {
            'active': 'background: #dcfce7; color: #166534;',
            'inactive': 'background: #fee2e2; color: #991b1b;',
            'default': 'background: #e5e7eb; color: #374151;'
        };
        return styles[status.toLowerCase()] || styles.default;
    }

    getDesignationText(designation) {
        const designations = {
            'CEO': 'Chief Executive Officer',
            'MD': 'Managing Director',
            'SBUHead': 'SBU Head',
            'ProjectHead': 'Project Head',
            'TeamHead': 'Team Head',
            'HR': 'Human Resource',
            'JuniorDeveloper': 'Junior Developer',
            'Developerintern': 'Developer Intern',
            'UI/UX designer': 'UI/UX Designer',
            'uiuxintern': 'UI/UX Intern',
            '3DArtist': '3D Artist',
            '3Dintern': '3D Artist Intern',
            'Admin': 'Admin',
            'Marketing': 'Marketing',
            'Marketingassociate': 'Marketing Associate'
        };
        return designations[designation] || designation || 'N/A';
    }

   viewEmployee(index) {
        const employee = this.filteredEmployees[index];
        if (!employee) {
            this.showToast('Error', 'Employee not found', 'error');
            return;
        }

        const viewContent = document.getElementById('employeeviewContent');
        
        if (!viewContent) {
            console.warn('View content element not found - creating fallback modal');
            this.createViewModal(employee);
            return;
        }
        
        // Handle both database and JavaScript field names
        const empId = employee.emp_id || employee.employeeId || 'N/A';
        const empName = employee.emp_name || employee.employeeName || 'N/A';
        const designation = employee.designation || 'N/A';
        const jobRole = employee.job_role || employee.jobRole || 'N/A';
        const workingStatus = employee.working_status || employee.workingStatus || 'N/A';
        const gender = employee.gender || 'N/A';
        const personalEmail = employee.personal_email || employee.emailPersonal || 'N/A';
        const officeEmail = employee.office_email || employee.emailOffice || 'N/A';
        const personalPhone = employee.personal_number || employee.phonePersonal || 'N/A';
        const officePhone = employee.office_number || employee.phoneOffice || 'N/A';
        const address = employee.address || 'N/A';
        const dateOfBirth = employee.date_of_birth || employee.dateOfBirth || 'N/A';
        const createdDate = employee.created_at || employee.createdDate;
        
        viewContent.innerHTML = `
            <div class="view-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="view-item">
                    <h4><i class="fas fa-id-card" style="color: #4f46e5; margin-right: 8px;"></i>Employee ID</h4>
                    <p><strong style="color: #4f46e5;">${empId}</strong></p>
                </div>
                <div class="view-item">
                    <h4><i class="fas fa-user" style="color: #4f46e5; margin-right: 8px;"></i>Employee Name</h4>
                    <p><strong>${empName}</strong></p>
                </div>
                <div class="view-item">
                    <h4><i class="fas fa-briefcase" style="color: #4f46e5; margin-right: 8px;"></i>Designation</h4>
                    <p>${this.getDesignationText(designation)}</p>
                </div>
                <div class="view-item">
                    <h4><i class="fas fa-user-tie" style="color: #4f46e5; margin-right: 8px;"></i>Job Role</h4>
                    <p>
                        <span class="badge" style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: capitalize; ${this.getBadgeStyle(jobRole)}">
                            ${jobRole}
                        </span>
                    </p>
                </div>
                <div class="view-item">
                    <h4><i class="fas fa-chart-line" style="color: #4f46e5; margin-right: 8px;"></i>Working Status</h4>
                    <p>
                        <span class="working-status" style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; ${this.getStatusStyle(workingStatus)}">
                            ${workingStatus}
                        </span>
                    </p>
                </div>
                <div class="view-item">
                    <h4><i class="fas fa-venus-mars" style="color: #4f46e5; margin-right: 8px;"></i>Gender</h4>
                    <p style="text-transform: capitalize;">${gender}</p>
                </div>
                <div class="view-item">
                    <h4><i class="fas fa-envelope" style="color: #4f46e5; margin-right: 8px;"></i>Email (Personal)</h4>
                    <p>
                        <a href="mailto:${personalEmail}" style="color: #3b82f6; text-decoration: none;">
                            ${personalEmail}
                        </a>
                    </p>
                </div>
                <div class="view-item">
                    <h4><i class="fas fa-envelope-open" style="color: #4f46e5; margin-right: 8px;"></i>Email (Office)</h4>
                    <p>
                        <a href="mailto:${officeEmail}" style="color: #3b82f6; text-decoration: none;">
                            ${officeEmail}
                        </a>
                    </p>
                </div>
                <div class="view-item">
                    <h4><i class="fas fa-phone" style="color: #4f46e5; margin-right: 8px;"></i>Phone (Personal)</h4>
                    <p>
                        <a href="tel:${personalPhone}" style="color: #3b82f6; text-decoration: none;">
                            ${personalPhone}
                        </a>
                    </p>
                </div>
                <div class="view-item">
                    <h4><i class="fas fa-phone-office" style="color: #4f46e5; margin-right: 8px;"></i>Phone (Office)</h4>
                    <p>
                        <a href="tel:${officePhone}" style="color: #3b82f6; text-decoration: none;">
                            ${officePhone}
                        </a>
                    </p>
                </div>
                <div class="view-item">
                    <h4><i class="fas fa-birthday-cake" style="color: #4f46e5; margin-right: 8px;"></i>Date of Birth</h4>
                    <p>${this.formatDate(dateOfBirth)}</p>
                </div>
                ${jobRole === 'onrole' ? `
                    <div class="view-item">
                        <h4><i class="fas fa-calendar-plus" style="color: #4f46e5; margin-right: 8px;"></i>Join Date</h4>
                        <p><strong style="color: #10b981;">${this.formatDate(employee.join_date || employee.joinDate)}</strong></p>
                    </div>
                ` : `
                    <div class="view-item">
                        <h4><i class="fas fa-calendar-alt" style="color: #4f46e5; margin-right: 8px;"></i>Intern Start Date</h4>
                        <p>${this.formatDate(employee.start_date || employee.startDate)}</p>
                    </div>
                    <div class="view-item">
                        <h4><i class="fas fa-calendar-check" style="color: #4f46e5; margin-right: 8px;"></i>Intern End Date</h4>
                        <p>${this.formatDate(employee.end_date || employee.endDate)}</p>
                    </div>
                    <div class="view-item">
                        <h4><i class="fas fa-clock" style="color: #4f46e5; margin-right: 8px;"></i>Duration</h4>
                        <p><strong style="color: #f59e0b;">${employee.duration || 'N/A'}</strong></p>
                    </div>
                `}
                <div class="view-item" style="grid-column: 1 / -1;">
                    <h4><i class="fas fa-map-marker-alt" style="color: #4f46e5; margin-right: 8px;"></i>Address</h4>
                    <p style="background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 3px solid #4f46e5;">
                        ${address}
                    </p>
                </div>
                <div class="view-item">
                    <h4><i class="fas fa-calendar" style="color: #4f46e5; margin-right: 8px;"></i>Registration Date</h4>
                    <p><strong style="color: #6b7280;">${this.formatDate(createdDate)}</strong></p>
                </div>
                <div class="view-item">
                    <h4><i class="fas fa-clock" style="color: #4f46e5; margin-right: 8px;"></i>Last Updated</h4>
                    <p style="font-size: 14px; color: #9ca3af;">${new Date().toLocaleString()}</p>
                </div>
            </div>
        `;
        
        // Add some enhanced styling to the view items if not already present
        const viewItems = document.querySelectorAll('.view-item');
        viewItems.forEach(item => {
            if (!item.style.padding) {
                item.style.cssText = `
                    padding: 16px;
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                `;
                
                // Add hover effect
                item.addEventListener('mouseenter', () => {
                    item.style.transform = 'translateY(-2px)';
                    item.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                });
                
                item.addEventListener('mouseleave', () => {
                    item.style.transform = 'translateY(0)';
                    item.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                });
            }
        });
        
        const viewModal = document.getElementById('employeeviewModal');
        if (viewModal) {
            viewModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Add close functionality if not already present
            const closeBtn = viewModal.querySelector('.close-btn, [data-close], .modal-close');
            if (closeBtn) {
                closeBtn.onclick = () => {
                    viewModal.classList.remove('show');
                    document.body.style.overflow = 'auto';
                };
            }
        } else {
            console.warn('viewModal element not found');
            this.showToast('Warning', 'View modal not found, using fallback display', 'warning');
        }
    }

    formatDate(dateString) {
        if (!dateString || dateString === 'N/A') return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (e) {
            return dateString;
        }
    }

    // Fallback modal creation if your existing viewModal/viewContent elements don't exist
    createViewModal(employee) {
        // Remove existing fallback modal if present
        const existingModal = document.querySelector('.employee-fallback-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'employee-fallback-modal';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 15px;
            padding: 30px;
            max-width: 800px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            transform: scale(0.9);
            transition: transform 0.3s ease;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        `;

        const empId = employee.emp_id || 'N/A';
        const empName = employee.emp_name || 'N/A';
        const designation = employee.designation || 'N/A';
        const jobRole = employee.job_role || 'N/A';
        const workingStatus = employee.working_status || 'N/A';
        const gender = employee.gender || 'N/A';
        const personalEmail = employee.personal_email || 'N/A';
        const officeEmail = employee.office_email || 'N/A';
        const personalPhone = employee.personal_number || 'N/A';
        const officePhone = employee.office_number || 'N/A';
        const address = employee.address || 'N/A';
        const dateOfBirth = employee.date_of_birth || 'N/A';
        const createdAt = employee.created_at;

        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e5e7eb;">
                <h2 style="color: #1f2937; margin: 0; font-size: 24px;">
                    <i class="fas fa-user-circle" style="color: #4f46e5; margin-right: 10px;"></i>
                    Employee Details
                </h2>
                <button onclick="this.closest('.employee-fallback-modal').remove()" 
                        style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; padding: 8px; border-radius: 50%; transition: all 0.2s ease;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                ${this.createDetailItem('fas fa-id-card', 'Employee ID', empId)}
                ${this.createDetailItem('fas fa-user', 'Full Name', empName)}
                ${this.createDetailItem('fas fa-briefcase', 'Designation', this.getDesignationText(designation))}
                ${this.createDetailItem('fas fa-user-tie', 'Job Role', `<span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: capitalize; ${this.getBadgeStyle(jobRole)}">${jobRole}</span>`)}
                ${this.createDetailItem('fas fa-chart-line', 'Working Status', `<span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; ${this.getStatusStyle(workingStatus)}">${workingStatus}</span>`)}
                ${this.createDetailItem('fas fa-venus-mars', 'Gender', gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase())}
                ${this.createDetailItem('fas fa-envelope', 'Personal Email', personalEmail)}
                ${this.createDetailItem('fas fa-envelope-open', 'Office Email', officeEmail)}
                ${this.createDetailItem('fas fa-phone', 'Personal Phone', personalPhone)}
                ${this.createDetailItem('fas fa-phone-office', 'Office Phone', officePhone)}
                ${this.createDetailItem('fas fa-birthday-cake', 'Date of Birth', this.formatDate(dateOfBirth))}
                
                ${jobRole === 'onrole' ? 
                    this.createDetailItem('fas fa-calendar-plus', 'Join Date', this.formatDate(employee.join_date)) :
                    `${this.createDetailItem('fas fa-calendar-alt', 'Start Date', this.formatDate(employee.start_date))}
                     ${this.createDetailItem('fas fa-calendar-check', 'End Date', this.formatDate(employee.end_date))}
                     ${this.createDetailItem('fas fa-clock', 'Duration', employee.duration || 'N/A')}`
                }
                
                <div style="grid-column: 1 / -1;">
                    ${this.createDetailItem('fas fa-map-marker-alt', 'Address', address)}
                </div>
                
                ${this.createDetailItem('fas fa-calendar', 'Registration Date', this.formatDate(createdAt))}
            </div>
        `;

        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        // Show modal with animation
        setTimeout(() => {
            modalOverlay.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 10);

        // Close modal when clicking outside
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.remove();
                document.body.style.overflow = 'auto';
            }
        });

        // Add escape key handler
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modalOverlay.remove();
                document.body.style.overflow = 'auto';
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        document.body.style.overflow = 'hidden';
    }

    createDetailItem(icon, label, value) {
        return `
            <div style="padding: 15px; background: #f8fafc; border-radius: 10px; border-left: 4px solid #4f46e5; transition: all 0.2s ease;">
                <div style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">
                    <i class="${icon}" style="color: #4f46e5; margin-right: 8px; width: 16px;"></i>
                    ${label}
                </div>
                <div style="color: #1f2937; font-size: 15px; word-break: break-word;">
                    ${value}
                </div>
            </div>
        `;
    }

    async deleteEmployee(index) {
        const employee = this.filteredEmployees[index];
        if (!employee) {
            this.showToast('Error', 'Employee not found', 'error');
            return;
        }

        const confirmDelete = confirm(
            `Are you sure you want to delete employee ${employee.emp_name} (${employee.emp_id})?\n\nThis action cannot be undone!`
        );

        if (!confirmDelete) return;

        try {
            this.showToast('Processing', `Deleting ${employee.emp_name}...`, 'info');

            const response = await this.fetchWithRetry(this.endpoints.delete, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `emp_id=${encodeURIComponent(employee.emp_id)}`
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                this.showToast('Success', `${employee.emp_name} deleted successfully`, 'success');
                await this.loadEmployees(false);
            } else {
                throw new Error(result.message || 'Failed to delete employee');
            }

        } catch (error) {
            console.error('Error deleting employee:', error);
            this.showToast('Error', 'Failed to delete employee: ' + error.message, 'error');
        }
    }

    createViewModal(employee) {
        // Create modal implementation here (same as before)
        this.showToast('Info', `View details for ${employee.emp_name} would open here`, 'info');
    }

    showLoading() {
        const tbody = document.getElementById('employeeTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 15px; color: #4f46e5;"></i>
                        <p style="margin: 0; font-size: 16px;">Loading employees from database...</p>
                        <small style="color: #9ca3af;">This may take a few moments</small>
                    </td>
                </tr>`;
        }
    }

    showError(message) {
        const tbody = document.getElementById('employeeTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px; color: #ef4444; opacity: 0.7;"></i>
                        <p style="margin: 0 0 10px 0; font-size: 18px; color: #ef4444; font-weight: 600;">Failed to Load Employees</p>
                        <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px; max-width: 600px; margin-left: auto; margin-right: auto;">${message}</p>
                        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                            <button onclick="window.employeeManager.loadEmployees()" 
                                    style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                <i class="fas fa-redo" style="margin-right: 8px;"></i>Try Again
                            </button>
                            <button onclick="window.employeeManager.testConnection()" 
                                    style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                <i class="fas fa-network-wired" style="margin-right: 8px;"></i>Test Connection
                            </button>
                        </div>
                    </td>
                </tr>`;
        }
    }

    updateStats() {
        const totalElement = document.getElementById('totalEmployees');
        const activeElement = document.getElementById('activeEmployees');
        const internElement = document.getElementById('internEmployees');
        const lastUpdatedElement = document.getElementById('lastUpdated');

        if (totalElement) {
            totalElement.textContent = this.employees.length;
        }
        
        if (activeElement) {
            const activeCount = this.employees.filter(emp => emp.working_status === 'Active').length;
            activeElement.textContent = activeCount;
        }
        
        if (internElement) {
            const internCount = this.employees.filter(emp => emp.job_role === 'intern').length;
            internElement.textContent = internCount;
        }
        
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = new Date().toLocaleTimeString();
        }
    }

    showToast(title, message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        const colors = {
            success: { bg: '#10b981', icon: 'check-circle' },
            error: { bg: '#ef4444', icon: 'exclamation-circle' },
            warning: { bg: '#f59e0b', icon: 'exclamation-triangle' },
            info: { bg: '#3b82f6', icon: 'info-circle' }
        };

        const color = colors[type] || colors.info;

        toast.style.cssText = `
            background: white;
            border-left: 4px solid ${color.bg};
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            min-width: 300px;
            max-width: 400px;
            pointer-events: auto;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        toast.innerHTML = `
            <div style="display: flex; align-items: start; gap: 12px;">
                <i class="fas fa-${color.icon}" style="color: ${color.bg}; margin-top: 2px; font-size: 16px;"></i>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px; color: #1f2937;">${title}</div>
                    <div style="font-size: 14px; color: #6b7280;">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    // Utility methods
    async refreshFromDatabase() {
        await this.loadEmployees(true);
    }

    getEmployeeById(empId) {
        return this.employees.find(emp => emp.emp_id === empId);
    }
}

// Global functions
function refreshEmployeeData() {
    if (typeof window.employeeManager !== 'undefined') {
        window.employeeManager.refreshFromDatabase();
    } else {
        console.warn('Employee manager not initialized');
    }
}

function testConnectionToDatabase() {
    if (typeof window.employeeManager !== 'undefined') {
        window.employeeManager.testConnection();
    } else {
        console.warn('Employee manager not initialized');
    }
}

// Initialize when DOM is ready
let employeeManager;
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Improved Employee Manager...');
    
    employeeManager = new ImprovedEmployeeManager();
    window.employeeManager = employeeManager;
    
    console.log('Employee Manager initialized successfully');
    console.log('Available methods: loadEmployees(), testConnection(), refreshFromDatabase()');
});

// Also handle case where script loads after DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if (!employeeManager) {
        employeeManager = new ImprovedEmployeeManager();
        window.employeeManager = employeeManager;
    }
}