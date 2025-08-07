// SmartTest Arena Frontend Application
class SmartTestArena {
    constructor() {
        // Use the current domain for API calls
        this.apiBaseUrl = window.location.origin;
        this.currentUser = null;
        this.authToken = localStorage.getItem('authToken');
        this.dashboardRefreshInterval = null;
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
        this.stopDashboardRefresh();
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
        
        // Navigation links
        document.querySelectorAll('nav a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('href').substring(1);
                this.showSection(section);
            });
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
        
        // Start real-time refresh every 30 seconds
        this.startDashboardRefresh();
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

    showProfileSection() {
        this.showSection('profile');
        if (this.currentUser) {
            this.loadProfileData();
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
            // Load real-time analytics
            const analytics = await this.apiRequest(`/analytics/dashboard/${this.currentUser.id}`);
            this.displayDashboardAnalytics(analytics);
            
            // Load subjects count
            const subjects = await this.apiRequest('/subjects');
            document.getElementById('totalSubjects').textContent = subjects.length;
            
            this.showToast('Dashboard loaded successfully', 'success');
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            // Fallback to basic data
            try {
                const subjects = await this.apiRequest('/subjects');
                document.getElementById('totalSubjects').textContent = subjects.length;
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
        }
    }

    displayDashboardAnalytics(analytics) {
        // Update real-time stats
        const stats = analytics.real_time_stats;
        document.getElementById('totalAttempts').textContent = stats.total_attempts;
        document.getElementById('avgScore').textContent = `${stats.average_score}%`;
        document.getElementById('todayActivity').textContent = stats.today_attempts;
        
        // Update recent activity
        const activityContainer = document.getElementById('recentActivity');
        if (analytics.recent_activity.length > 0) {
            activityContainer.innerHTML = analytics.recent_activity.map(activity => `
                <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center">
                        <i class="fas fa-question-circle text-blue-500 mr-2"></i>
                        <span>${activity.subject} - ${activity.score}</span>
                    </div>
                    <span class="text-gray-500">${activity.time}</span>
                </div>
            `).join('');
        } else {
            activityContainer.innerHTML = '<p class="text-gray-500 text-sm">No recent activity</p>';
        }
        
        // Add weekly progress indicator
        const weeklyProgress = analytics.weekly_progress;
        if (weeklyProgress.attempts_count > 0) {
            const progressIndicator = document.createElement('div');
            progressIndicator.className = 'mt-4 p-3 bg-blue-50 rounded-lg';
            progressIndicator.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-blue-700">Weekly Progress</span>
                    <span class="text-sm text-blue-600">${weeklyProgress.attempts_count} attempts</span>
                </div>
                <div class="mt-2">
                    <div class="flex justify-between text-xs text-blue-600">
                        <span>Weekly Average: ${weeklyProgress.average_score}%</span>
                        <span class="${weeklyProgress.improvement === 'positive' ? 'text-green-600' : 'text-gray-600'}">
                            ${weeklyProgress.improvement === 'positive' ? '↗ Improving' : '→ Stable'}
                        </span>
                    </div>
                </div>
            `;
            activityContainer.appendChild(progressIndicator);
        }
    }

    startDashboardRefresh() {
        // Clear any existing interval
        if (this.dashboardRefreshInterval) {
            clearInterval(this.dashboardRefreshInterval);
        }
        
        // Start new refresh interval (30 seconds)
        this.dashboardRefreshInterval = setInterval(() => {
            if (this.currentUser && document.getElementById('dashboard').classList.contains('hidden') === false) {
                this.loadDashboardData();
            }
        }, 30000); // 30 seconds
    }

    stopDashboardRefresh() {
        if (this.dashboardRefreshInterval) {
            clearInterval(this.dashboardRefreshInterval);
            this.dashboardRefreshInterval = null;
        }
    }

    // Display Methods
    displaySubjects(subjects) {
        const container = document.getElementById('subjectsList');
        container.innerHTML = '';
        
        if (subjects.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-500 mb-4">No subjects available yet.</p>
                    ${this.currentUser && this.currentUser.is_tutor ? 
                        '<button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Add Your First Subject</button>' : 
                        '<p class="text-sm text-gray-400">Subjects will appear here when tutors add them.</p>'
                    }
                </div>
            `;
            return;
        }
        
        subjects.forEach(subject => {
            const card = document.createElement('div');
            card.className = 'bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer';
            card.innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-xl font-semibold text-gray-800">${subject.name}</h4>
                    <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">${subject.grade_level || 'All Grades'}</span>
                </div>
                <p class="text-gray-600 mb-4">${subject.description || 'No description available'}</p>
                <div class="flex justify-between text-sm text-gray-500">
                    <span>Curriculum: ${subject.curriculum || 'N/A'}</span>
                    <span>Created: ${new Date(subject.created_at).toLocaleDateString()}</span>
                </div>
                <div class="mt-4 flex space-x-2">
                    <button class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition">View Topics</button>
                    <button class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition">Start Quiz</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    displayAnalytics(analytics) {
        const container = document.getElementById('topicPerformance');
        container.innerHTML = '<p class="text-gray-500">Analytics data loaded successfully</p>';
    }

    async loadProfileData() {
        if (!this.currentUser) return;
        
        try {
            const profileInfo = document.getElementById('profileInfo');
            const recommendations = document.getElementById('recommendations');
            
            // Display user info
            profileInfo.innerHTML = `
                <div class="space-y-2">
                    <div><strong>Name:</strong> ${this.currentUser.name}</div>
                    <div><strong>Email:</strong> ${this.currentUser.email}</div>
                    <div><strong>Role:</strong> ${this.currentUser.is_tutor ? 'Tutor' : 'Student'}</div>
                    <div><strong>Member since:</strong> ${new Date(this.currentUser.created_at).toLocaleDateString()}</div>
                </div>
            `;
            
            // Display recommendations
            recommendations.innerHTML = '<p class="text-gray-500">Profile recommendations will appear here</p>';
            
            this.showToast('Profile loaded successfully', 'success');
        } catch (error) {
            console.error('Failed to load profile data:', error);
        }
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
