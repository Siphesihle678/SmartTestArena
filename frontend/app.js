// SmartTest Arena Frontend Application
class SmartTestArena {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8001';
        this.currentUser = null;
        this.authToken = localStorage.getItem('authToken');
        this.init();
    }

    async init() {
        console.log('🚀 Initializing SmartTest Arena Frontend...');
        if (this.authToken) {
            await this.validateToken();
        }
        this.setupEventListeners();
        this.showAppropriateSection();
    }

    // API Communication
    async apiRequest(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
                ...options.headers
            },
            ...options
        };

        try {
            this.showLoading();
            const response = await fetch(url, config);
            this.hideLoading();

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            this.hideLoading();
            this.showToast(`API Error: ${error.message}`, 'error');
            throw error;
        }
    }

    // Authentication
    async signup(userData) {
        try {
            const response = await this.apiRequest('/auth/signup', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            
            this.authToken = response.access_token;
            localStorage.setItem('authToken', this.authToken);
            await this.validateToken();
            this.showToast('Account created successfully!', 'success');
            this.showDashboard();
            return response;
        } catch (error) {
            this.showToast('Signup failed: ' + error.message, 'error');
            throw error;
        }
    }

    async login(credentials) {
        try {
            const response = await this.apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });
            
            this.authToken = response.access_token;
            localStorage.setItem('authToken', this.authToken);
            await this.validateToken();
            this.showToast('Login successful!', 'success');
            this.showDashboard();
            return response;
        } catch (error) {
            this.showToast('Login failed: ' + error.message, 'error');
            throw error;
        }
    }

    async validateToken() {
        try {
            const userData = await this.apiRequest('/auth/me');
            this.currentUser = userData;
            this.updateAuthUI();
            return userData;
        } catch (error) {
            this.logout();
            throw error;
        }
    }

    logout() {
        this.authToken = null;
        this.currentUser = null;
        localStorage.removeItem('authToken');
        this.updateAuthUI();
        this.showWelcome();
        this.showToast('Logged out successfully', 'info');
    }

    // Data Loading
    async getSubjects() {
        try {
            const subjects = await this.apiRequest('/subjects');
            this.displaySubjects(subjects);
            return subjects;
        } catch (error) {
            this.showToast('Failed to load subjects', 'error');
            throw error;
        }
    }

    async getUserAnalytics(userId) {
        try {
            const analytics = await this.apiRequest(`/analytics/user/${userId}`);
            this.displayAnalytics(analytics);
            return analytics;
        } catch (error) {
            this.showToast('Failed to load analytics', 'error');
            throw error;
        }
    }

    async submitQuizAttempt(attemptData) {
        try {
            const result = await this.apiRequest('/quiz/attempts', {
                method: 'POST',
                body: JSON.stringify(attemptData)
            });
            this.showToast('Quiz submitted successfully!', 'success');
            return result;
        } catch (error) {
            this.showToast('Failed to submit quiz', 'error');
            throw error;
        }
    }

    // UI Methods
    setupEventListeners() {
        // Authentication
        document.getElementById('loginBtn').addEventListener('click', () => this.showLoginForm());
        document.getElementById('signupBtn').addEventListener('click', () => this.showSignupForm());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Form submissions
        document.getElementById('loginFormElement').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signupFormElement').addEventListener('submit', (e) => this.handleSignup(e));
        
        // Navigation
        document.getElementById('showSignup').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignupForm();
        });
        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });
        
        // Dashboard actions
        document.getElementById('startQuizBtn').addEventListener('click', () => this.showQuizSection());
        document.getElementById('viewAnalyticsBtn').addEventListener('click', () => this.showAnalyticsSection());
        document.getElementById('manageContentBtn').addEventListener('click', () => this.showSubjectsSection());
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (this.currentUser) {
            loginBtn.classList.add('hidden');
            signupBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
        } else {
            loginBtn.classList.remove('hidden');
            signupBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            await this.login({ email, password });
        } catch (error) {
            console.error('Login failed:', error);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const isTutor = document.getElementById('isTutor').checked;
        
        try {
            await this.signup({ name, email, password, is_tutor: isTutor });
        } catch (error) {
            console.error('Signup failed:', error);
        }
    }

    // Section Display
    showSection(sectionId) {
        const sections = ['welcome', 'authForms', 'dashboard', 'subjects', 'quiz', 'analytics', 'profile'];
        sections.forEach(section => {
            document.getElementById(section).classList.add('hidden');
        });
        document.getElementById(sectionId).classList.remove('hidden');
        this.loadSectionData(sectionId);
    }

    showWelcome() {
        this.showSection('welcome');
    }

    showLoginForm() {
        this.showSection('authForms');
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('signupForm').classList.add('hidden');
    }

    showSignupForm() {
        this.showSection('authForms');
        document.getElementById('signupForm').classList.remove('hidden');
        document.getElementById('loginForm').classList.add('hidden');
    }

    showDashboard() {
        this.showSection('dashboard');
        this.loadDashboardData();
    }

    showSubjectsSection() {
        this.showSection('subjects');
        this.getSubjects();
    }

    showQuizSection() {
        this.showSection('quiz');
    }

    showAnalyticsSection() {
        this.showSection('analytics');
        if (this.currentUser) {
            this.getUserAnalytics(this.currentUser.id);
        }
    }

    showAppropriateSection() {
        if (this.currentUser) {
            this.showDashboard();
        } else {
            this.showWelcome();
        }
    }

    async loadSectionData(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'subjects':
                await this.getSubjects();
                break;
            case 'analytics':
                if (this.currentUser) {
                    await this.getUserAnalytics(this.currentUser.id);
                }
                break;
        }
    }

    async loadDashboardData() {
        if (!this.currentUser) return;
        
        try {
            const subjects = await this.apiRequest('/subjects');
            document.getElementById('totalSubjects').textContent = subjects.length;
            this.showToast('Dashboard loaded successfully', 'success');
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    // Display Methods
    displaySubjects(subjects) {
        const container = document.getElementById('subjectsList');
        container.innerHTML = '';
        
        subjects.forEach(subject => {
            const card = document.createElement('div');
            card.className = 'subject-card';
            card.innerHTML = `
                <h4>${subject.name}</h4>
                <p>${subject.description || 'No description available'}</p>
                <div class="subject-stats">
                    <span>Grade: ${subject.grade_level || 'N/A'}</span>
                    <span>Curriculum: ${subject.curriculum || 'N/A'}</span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    displayAnalytics(analytics) {
        const container = document.getElementById('topicPerformance');
        container.innerHTML = '<p class="text-gray-500">Analytics data loaded successfully</p>';
    }

    // Utility Methods
    showLoading() {
        document.getElementById('loadingSpinner').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingSpinner').classList.add('hidden');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.smartTestArena = new SmartTestArena();
});
