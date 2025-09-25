class ClientManager {
    constructor() {
        this.clients = [];
        this.pendingStatusIndex = null;
        this.pendingStatusNewValue = null;
        this.initializeEventListeners();
        this.setDefaultDate();
    }

 initializeEventListeners() {
    document.getElementById('clientForm').addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit(e);
    });

    document.getElementById('confirmYesBtn').addEventListener('click', () => {
        this.confirmStatusChange(true);
    });

    document.getElementById('confirmNoBtn').addEventListener('click', () => {
        this.confirmStatusChange(false);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            this.closeForm();
            this.closeViewModal();
        }
    });
}

    

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('createdDate').value = today;
    }

    openForm() {
        document.getElementById('clientModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeForm() {
        document.getElementById('clientModal').classList.remove('show');
        document.body.style.overflow = 'auto';
        this.resetForm();
    }

    closeViewModal() {
        document.getElementById('clientviewModal').classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    resetForm() {
        document.getElementById('clientForm').reset();
        this.setDefaultDate();
    }

    handleFormSubmit() {
        const form = document.getElementById('clientForm');

    if (!form.reportValidity()) {
        // Don't proceed if the form is invalid
        return;
    }
        const formData = new FormData(document.getElementById('clientForm'));
        const clientData = {
            id: Date.now().toString(),
            customerId: formData.get('customerId'),
            companyName: formData.get('companyName'),
            customerName: formData.get('customerName'),
            createdDate: formData.get('createdDate'),
            industrySegment: formData.get('industrySegment') || 'N/A',
            manufacturersOf: formData.get('manufacturersOf') || 'N/A',
            reference: formData.get('reference') || 'N/A',
            repeatedClient: formData.get('repeatedClient'),
            contactPerson: formData.get('contactPerson') || 'N/A',
            gstNo: formData.get('gstNo') || 'N/A',
            phoneNo: formData.get('phoneNo'),
            mailId: formData.get('mailId'),
            address: formData.get('address') || 'N/A',
            status: 'none'
        };
        this.addClient(clientData);
        this.closeForm();
        this.showToast('Client Added Successfully', `${clientData.customerName} has been added to the client list.`);
    }

    addClient(clientData) {
        this.clients.push(clientData);
        this.updateTable();
    }

    updateTable() {
        const tbody = document.getElementById('clientTableBody');
        if (this.clients.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="8">
                        <div class="empty-content">
                            <i class="fas fa-users"></i>
                            <p>No clients found</p>
                            <small>Click "Add Client" to get started</small>
                        </div>
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = this.clients.map((client, index) => `
            <tr>
                <td>
                    <select class="status-badge status-${client.status}" onchange="clientManager.updateStatus(${index}, this.value)">
                        <option value="lead" ${client.status.toLowerCase() === 'lead' ? 'selected' : ''}>Lead</option>
                        <option value="drop" ${client.status.toLowerCase() === 'drop' ? 'selected' : ''}>Drop</option>
                        <option value="onboard" ${client.status.toLowerCase() === 'onboard' ? 'selected' : ''}>Onboard</option>
                        <option value="quotation" ${client.status.toLowerCase() === 'quotation' ? 'selected' : ''}>Quotation</option>
                        <option value="inprogress" ${client.status.toLowerCase().replace(/\s+/g, '') === 'inprogress' ? 'selected' : ''}>In progress</option>
                        <option value="notinterest" ${client.status.toLowerCase().replace(/\s+/g, '') === 'notinterest' ? 'selected' : ''}>Not Interest</option>
                        <option value="none" ${client.status.toLowerCase().replace(/\s+/g, '') === 'none' ? 'selected' : ''}>None</option>
                    </select>

                </td>
                <td>${this.formatDate(client.createdDate)}</td>
                <td>${client.customerId}</td>
                <td>${client.companyName}</td>
                <td>${client.customerName}</td>
                <td>${client.phoneNo}</td>
                <td>${client.mailId}</td>
                <td>
                    <button class="view-btn" onclick="clientManager.viewClient(${index})">View</button>
                </td>
            </tr>`).join('');
    }

   updateStatus(index, newStatus) {
    // Store pending change info
    this.pendingStatusIndex = index;
    this.pendingStatusNewValue = newStatus;

    const client = this.clients[index];
    const confirmMessage = document.getElementById('confirmMessage');
    confirmMessage.textContent = `Are you sure you want to change ${client.companyName} status to ${newStatus} ?`;

    // Show confirm modal
    document.getElementById('confirmModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

confirmStatusChange(confirmed) {
    const confirmModal = document.getElementById('confirmModal');
    confirmModal.classList.remove('show');
    document.body.style.overflow = 'auto';

    const index = this.pendingStatusIndex;
    const newStatus = this.pendingStatusNewValue;

    if (confirmed && index != null && this.clients && this.clients[index]) {
        // Apply the status change
        this.clients[index].status = newStatus;

        const selectElement = document.querySelector(`tr:nth-child(${index + 1}) select`);
        if (selectElement) {
            selectElement.className = `status-badge status-${newStatus}`;
            selectElement.value = newStatus;
        }
    } else if (!confirmed && index != null && this.clients && this.clients[index]) {
        // Revert dropdown to old status on cancellation
        const selectElement = document.querySelector(`tr:nth-child(${index + 1}) select`);
        if (selectElement) {
            selectElement.value = this.clients[index].status;
        }
    }

    // Clear pending info
    this.pendingStatusIndex = null;
    this.pendingStatusNewValue = null;
    
}





    viewClient(index) {
        const client = this.clients[index];
        const viewContent = document.getElementById('clientviewContent');
        viewContent.innerHTML = `
            <form>
                <div class="form-grid1">
                <div class="form-group">
                    <label for="status"><strong>Status</strong></label>
                    <select id="status" name="status" required>
                    <option value="">Select status</option>
                    <option value="lead" ${client.status === 'lead' ? 'selected' : ''}>Lead</option>
                    <option value="drop" ${client.status === 'drop' ? 'selected' : ''}>Drop</option>
                    <option value="onboard" ${client.status === 'onboard' ? 'selected' : ''}>Onboard</option>
                    <option value="quotation" ${client.status === 'quotation' ? 'selected' : ''}>Quotation</option>
                    <option value="inprogress" ${client.status === 'inprogress' ? 'selected' : ''}>In Progress</option>
                    <option value="notinterested" ${client.status === 'notinterested' ? 'selected' : ''}>Not Interested</option>
                    <option value="none" ${client.status === 'none' ? 'selected' : ''}>None</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="customerId">Customer ID *</label>
                    <input type="text" id="customerId" name="customerId" value="${client.customerId}" required>
                </div>
                <div class="form-group">
                    <label for="companyName">Company Name *</label>
                    <input type="text" id="companyName" name="companyName" value="${client.companyName}" required>
                </div>
                <div class="form-group full-width">
                    <label for="address">Address</label>
                    <textarea id="address" name="address" rows="3">${client.address}</textarea>
                </div>
                <div class="form-group">
                    <label for="customerName">Customer Name *</label>
                    <input type="text" id="customerName" name="customerName" value="${client.customerName}" required>
                </div>
                <div class="form-group">
                    <label for="contactPerson">Contact Person *</label>
                    <input type="text" id="contactPerson" name="contactPerson" value="${client.contactPerson}">
                </div>
                <div class="form-group">
                    <label for="phoneNo">Phone No *</label>
                    <input type="tel" id="phoneNo" name="phoneNo" value="${client.phoneNo}" required>
                </div>
                <div class="form-group">
                    <label for="mailId">Mail ID *</label>
                    <input type="email" id="mailId" name="mailId" value="${client.mailId}" required>
                </div>
                <div class="form-group">
                    <label>Repeated Client</label>
                    <div class="radio-group">
                    <input type="radio" id="repeatedYes" name="repeatedClient" value="yes" ${client.repeatedClient === 'yes' ? 'checked' : ''}>
                    <label for="repeatedYes">Yes</label>
                    <input type="radio" id="repeatedNo" name="repeatedClient" value="no" ${client.repeatedClient !== 'yes' ? 'checked' : ''}>
                    <label for="repeatedNo">No</label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="industrySegment">Industry Segment</label>
                    <input type="text" id="industrySegment" name="industrySegment" value="${client.industrySegment}">
                </div>
                <div class="form-group">
                    <label for="manufacturersOf">Manufacturers Of</label>
                    <input type="text" id="manufacturersOf" name="manufacturersOf" value="${client.manufacturersOf}">
                </div>
                <div class="form-group">
                    <label for="reference">Reference</label>
                    <input type="text" id="reference" name="reference" value="${client.reference}">
                </div>
                <div class="form-group">
                    <label for="gstNo">GST No</label>
                    <input type="text" id="gstNo" name="gstNo" value="${client.gstNo}">
                </div>
                <div class="form-group">
                    <label for="createdDate">Created Date *</label>
                    <input type="date" id="createdDate" name="createdDate" value="${new Date(client.createdDate).toISOString().split('T')[0]}" required>
                </div>
                </div>

                <div style="margin-top: 20px;">
                <button type="submit" class="btn btn-primary">Update Details</button>
                </div>
            </form>
            `;

        document.getElementById('clientviewModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    showToast(title, description) {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `<h4>${title}</h4><p>${description}</p>`;
        toastContainer.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 3000);
    }
}


// Initialize the client manager
const clientManager = new ClientManager();

// Demo clients data
const demoClients = [
    {
        id: '1',
        customerId: 'C1001',
        companyName: 'Acme Corp',
        customerName: 'John Doe',
        createdDate: '2025-09-01',
        industrySegment: 'Manufacturing',
        manufacturersOf: 'Widgets',
        reference: 'Referral',
        repeatedClient: 'no',
        contactPerson: 'Jane Smith',
        gstNo: 'GSTIN12345',
        phoneNo: '9876543210',
        mailId: 'john.doe@acme.com',
        address: '123 Main Street, Chennai',
        status: 'onboard'
    },
    {
        id: '2',
        customerId: 'C1002',
        companyName: 'Globex Ltd.',
        customerName: 'Alice Lee',
        createdDate: '2025-09-03',
        industrySegment: 'IT Services',
        manufacturersOf: 'Software',
        reference: 'Website',
        repeatedClient: 'yes',
        contactPerson: 'Bob Brown',
        gstNo: 'GSTIN67890',
        phoneNo: '9123456780',
        mailId: 'alice.lee@globex.com',
        address: '456 Park Avenue, Coimbatore',
        status: 'quotation'
    }
];

// Add demo clients to the table
demoClients.forEach(client => clientManager.addClient(client));


// Global functions for HTML onclick handlers
function openForm() {
    clientManager.openForm();
}

function closeForm() {
    clientManager.closeForm();
}

function closeViewModal() {
    clientManager.closeViewModal();
}
