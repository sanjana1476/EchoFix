// Mock data storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let issues = JSON.parse(localStorage.getItem('issues')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// UI Functions
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
}

function showDashboard() {
    document.querySelector('.auth-container').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('user-name').textContent = currentUser.name;
    renderIssues();
}

function renderIssues() {
    const container = document.getElementById('issues-container');
    const userIssues = issues.filter(issue => issue.userId === currentUser.id);
    
    container.innerHTML = userIssues.map(issue => `
        <div class="issue-card">
            <h4>${issue.title}</h4>
            <p>${issue.description}</p>
            <div class="issue-photos">
                ${issue.photos && issue.photos.length > 0 ? 
                    issue.photos.map(photo => `<img src="${photo}" alt="Issue photo" style="max-width: 200px; margin: 10px 10px 10px 0;">`).join('') 
                    : ''}
            </div>
            <span class="issue-status status-${issue.status}">${issue.status}</span>
            <div style="margin-top: 10px; font-size: 12px; color: #666;">
                Reported on: ${new Date(issue.date).toLocaleDateString()}
            </div>
        </div>
    `).join('') || '<p>No issues reported yet.</p>';
}

// Auth Functions
function login(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showDashboard();
        return true;
    }
    return false;
}

function signup(name, email, password, unit) {
    if (users.some(u => u.email === email)) {
        alert('Email already registered');
        return false;
    }

    const user = {
        id: Date.now().toString(),
        name,
        email,
        password,
        unit,
        role: 'resident'
    };

    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    showDashboard();
    return true;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.querySelector('.auth-container').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
}

// Event Listeners
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.elements[0].value;
    const password = e.target.elements[1].value;
    
    if (!login(email, password)) {
        alert('Invalid credentials');
    }
});

document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = e.target.elements[0].value;
    const email = e.target.elements[1].value;
    const password = e.target.elements[2].value;
    const unit = e.target.elements[3].value;
    
    signup(name, email, password, unit);
});

// Character count for description
document.getElementById('issue-description').addEventListener('input', (e) => {
    const count = e.target.value.length;
    document.getElementById('char-count').textContent = count;
    
    if (count > 450) {
        document.getElementById('char-count').style.color = '#FF6B6B';
    } else {
        document.getElementById('char-count').style.color = '#64748B';
    }
});

// Photo preview handling
const previewContainer = document.getElementById('preview-container');
const photoInput = document.getElementById('issue-photo');

photoInput.addEventListener('change', () => {
    previewContainer.innerHTML = '';
    const files = Array.from(photoInput.files);
    
    if (files.length > 3) {
        alert('You can only upload up to 3 photos');
        photoInput.value = '';
        return;
    }

    files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
            alert('File size should not exceed 5MB');
            photoInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('preview-image');
            previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
});

// Form submission
document.getElementById('issue-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check if user is logged in
    if (!currentUser) {
        alert('Please log in to submit an issue');
        return;
    }

    try {
        // Get form data
        const title = document.getElementById('issue-title').value.trim();
        const category = document.getElementById('issue-category').value;
        const description = document.getElementById('issue-description').value.trim();
        const priorityElement = document.querySelector('input[name="priority"]:checked');

        // Validate required fields
        if (!title || !category || !description || !priorityElement) {
            alert('Please fill in all required fields');
            return;
        }

        // Handle photos
        const photoFiles = Array.from(document.getElementById('issue-photo').files);
        if (photoFiles.length > 3) {
            alert('Maximum 3 photos allowed');
            return;
        }

        const photoPromises = photoFiles.map(file => {
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('File size should not exceed 5MB');
            }
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        const photos = await Promise.all(photoPromises);

        const issue = {
            id: Date.now().toString(),
            userId: currentUser.id,
            title,
            category,
            description,
            priority: priorityElement.value,
            photos,
            status: 'pending',
            date: new Date().toISOString()
        };

        // Add issue to storage
        issues.push(issue);
        localStorage.setItem('issues', JSON.stringify(issues));
        
        // Show feedback toast
        const toast = document.getElementById('feedback-toast');
        toast.classList.add('show');
        
        // Reset form and update UI
        e.target.reset();
        previewContainer.innerHTML = '';
        document.getElementById('char-count').textContent = '0';
        renderIssues();

        // Hide toast after animation
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);

    } catch (error) {
        alert(error.message || 'Error submitting issue. Please try again.');
    }
});

document.getElementById('issue-photo').addEventListener('change', (e) => {
    const fileName = e.target.files[0]?.name || '';
    document.getElementById('file-name').textContent = fileName;
});

// Check if user is already logged in
if (currentUser) {
    showDashboard();
}
