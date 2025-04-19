// Mock admin credentials
const ADMIN_CREDENTIALS = {
    email: 'admin@echofix.com',
    password: 'admin123'
    email:'sanjana@echofix.com',
    password:'sanju'
};

// Get data from localStorage
let issues = JSON.parse(localStorage.getItem('issues')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentAdmin = JSON.parse(localStorage.getItem('currentAdmin')) || null;

// UI Functions
function showDashboard() {
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    updateDashboard();
}

function updateDashboard() {
    updateStats();
    renderIssues();
}

function updateStats() {
    document.getElementById('pending-count').textContent = 
        issues.filter(issue => issue.status === 'pending').length;
    document.getElementById('progress-count').textContent = 
        issues.filter(issue => issue.status === 'in-progress').length;
    document.getElementById('resolved-count').textContent = 
        issues.filter(issue => issue.status === 'resolved').length;
}

function getStatusClass(status) {
    switch(status) {
        case 'pending': return 'status-pending';
        case 'in-progress': return 'status-progress';
        case 'resolved': return 'status-resolved';
        default: return '';
    }
}

function renderIssues() {
    const statusFilter = document.getElementById('status-filter').value;
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    
    let filteredIssues = issues;
    
    // Apply status filter
    if (statusFilter !== 'all') {
        filteredIssues = filteredIssues.filter(issue => issue.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
        filteredIssues = filteredIssues.filter(issue => {
            const user = users.find(u => u.id === issue.userId);
            return (
                issue.title.toLowerCase().includes(searchQuery) ||
                issue.description.toLowerCase().includes(searchQuery) ||
                user?.name.toLowerCase().includes(searchQuery) ||
                user?.unit.toLowerCase().includes(searchQuery)
            );
        });
    }

    const tbody = document.getElementById('issues-list');
    tbody.innerHTML = filteredIssues.map(issue => {
        const user = users.find(u => u.id === issue.userId);
        return `
            <tr>
                <td>${new Date(issue.date).toLocaleDateString()}</td>
                <td>${user?.name || 'Unknown'}</td>
                <td>${user?.unit || 'N/A'}</td>
                <td>
                    <strong>${issue.title}</strong>
                    <br>
                    <small>${issue.description}</small>
                    <button class="btn-secondary" onclick='showIssueDetails(${JSON.stringify(issue).replace(/'/g, "&apos;")})'>View Details</button>
                </td>
                <td>
                    <span class="priority-badge priority-${issue.priority}">
                        ${issue.priority}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${getStatusClass(issue.status)}">
                        ${issue.status}
                    </span>
                </td>
                <td>${issue.assignedTo || 'Unassigned'}</td>
                <td>
                    <button 
                        onclick="openAssignmentModal('${issue.id}')"
                        class="btn-secondary"
                        ${issue.status === 'resolved' ? 'disabled' : ''}
                    >
                        Assign Worker
                    </button>
                    ${issue.status !== 'resolved' ? `
                        <button 
                            onclick="markResolved('${issue.id}')"
                            class="btn-secondary"
                            style="margin-top: 5px;"
                        >
                            Mark Resolved
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// Modal Functions
let selectedIssueId = null;

function showIssueDetails(issue) {
    document.getElementById('issue-title').textContent = issue.title;
    document.getElementById('issue-description').textContent = issue.description;
    document.getElementById('issue-category').textContent = issue.category;
    document.getElementById('issue-priority').textContent = issue.priority;
    document.getElementById('issue-status').textContent = issue.status;
    document.getElementById('issue-date').textContent = new Date(issue.date).toLocaleString();

    const photosContainer = document.getElementById('issue-photos');
    photosContainer.innerHTML = '';
    
    if (issue.photos && issue.photos.length > 0) {
        document.getElementById('issue-photos-container').style.display = 'block';
        issue.photos.forEach(photo => {
            const img = document.createElement('img');
            img.src = photo;
            img.alt = 'Issue photo';
            img.onclick = () => window.open(photo, '_blank');
            photosContainer.appendChild(img);
        });
    } else {
        document.getElementById('issue-photos-container').style.display = 'none';
    }

    document.getElementById('issue-details-modal').classList.remove('hidden');
}

function closeIssueDetailsModal() {
    document.getElementById('issue-details-modal').classList.add('hidden');
}


function openAssignmentModal(issueId) {
    selectedIssueId = issueId;
    document.getElementById('assignment-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('assignment-modal').classList.add('hidden');
    selectedIssueId = null;
}

// Action Functions
function assignWorker(workerId) {
    if (!selectedIssueId) return;
    
    issues = issues.map(issue => {
        if (issue.id === selectedIssueId) {
            return {
                ...issue,
                assignedTo: workerId,
                status: 'in-progress'
            };
        }
        return issue;
    });
    
    localStorage.setItem('issues', JSON.stringify(issues));
    updateDashboard();
    closeModal();
}

function markResolved(issueId) {
    issues = issues.map(issue => {
        if (issue.id === issueId) {
            return {
                ...issue,
                status: 'resolved'
            };
        }
        return issue;
    });
    
    localStorage.setItem('issues', JSON.stringify(issues));
    updateDashboard();
}

function adminLogout() {
    currentAdmin = null;
    localStorage.removeItem('currentAdmin');
    document.getElementById('admin-login').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
}

// Event Listeners
document.getElementById('admin-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.elements[0].value;
    const password = e.target.elements[1].value;
    
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        currentAdmin = { email };
        localStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
        showDashboard();
    } else {
        alert('Invalid admin credentials');
    }
});

document.getElementById('assignment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const workerId = document.getElementById('worker-select').value;
    assignWorker(workerId);
});

document.getElementById('status-filter').addEventListener('change', renderIssues);
document.getElementById('search-input').addEventListener('input', renderIssues);

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    const issueDetailsModal = document.getElementById('issue-details-modal');
    const assignmentModal = document.getElementById('assignment-modal');
    
    if (e.target === issueDetailsModal) {
        closeIssueDetailsModal();
    } else if (e.target === assignmentModal) {
        closeModal();
    }
});

// Check if admin is already logged in
if (currentAdmin) {
    showDashboard();
}
