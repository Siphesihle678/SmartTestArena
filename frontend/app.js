// SmartTest Arena Frontend Application
class SmartTestArena {
    constructor() {
        // Use the current domain for API calls
        this.apiBaseUrl = window.location.origin;
        this.currentUser = null;
        this.authToken = localStorage.getItem('authToken');
        this.dashboardRefreshInterval = null;
        this.performanceChart = null;
        this.analyticsChart = null;
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
        this.destroyCharts();
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
        
        // Initialize charts if not already done
        setTimeout(() => this.initializeCharts(), 100);
        
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
        
        // Initialize charts if not already done
        setTimeout(() => this.initializeCharts(), 100);
        
        if (this.currentUser) {
            this.loadAnalyticsData();
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
                    const analytics = await this.apiRequest(`/analytics/dashboard/${this.currentUser.id}`);
                    this.displayAnalytics(analytics);
                } else {
                    this.showToast('Please log in to view analytics.', 'error');
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

    async loadAnalyticsData() {
        if (!this.currentUser) return;
        
        try {
            const analytics = await this.apiRequest(`/analytics/dashboard/${this.currentUser.id}`);
            this.displayAnalytics(analytics);
            this.showToast('Analytics loaded successfully', 'success');
        } catch (error) {
            console.error('Failed to load analytics data:', error);
            this.showToast('Failed to load analytics data', 'error');
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
        
        // Update progress chart
        this.updateProgressChart(analytics);
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

    // Chart Methods
    initializeCharts() {
        // Initialize dashboard performance chart (mini chart)
        const dashboardCtx = document.getElementById('dashboardPerformanceChart');
        if (dashboardCtx && !this.performanceChart) {
            this.performanceChart = new Chart(dashboardCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Daily Performance',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            display: false
                        },
                        y: {
                            display: false,
                            min: 0,
                            max: 100
                        }
                    },
                    elements: {
                        point: {
                            radius: 0
                        }
                    }
                }
            });
        }

        // Initialize analytics page chart (detailed chart)
        const analyticsCtx = document.getElementById('performanceChart');
        if (analyticsCtx && !this.analyticsChart) {
            this.analyticsChart = new Chart(analyticsCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Average Score',
                        data: [],
                        backgroundColor: 'rgba(59, 130, 246, 0.6)',
                        borderColor: '#3B82F6',
                        borderWidth: 1
                    }, {
                        label: 'Attempts',
                        data: [],
                        backgroundColor: 'rgba(34, 197, 94, 0.6)',
                        borderColor: '#22C55E',
                        borderWidth: 1,
                        yAxisID: 'y1'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Subject Performance Overview'
                        },
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: 'Average Score (%)'
                            },
                            min: 0,
                            max: 100
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: 'Number of Attempts'
                            },
                            min: 0,
                            grid: {
                                drawOnChartArea: false,
                            },
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Subjects'
                            }
                        }
                    }
                }
            });
        }
    }

    updateProgressChart(analytics) {
        // Update dashboard mini chart
        if (this.performanceChart && analytics.recent_activity.length > 0) {
            const weeklyData = this.generateWeeklyData(analytics.recent_activity);
            this.performanceChart.data.datasets[0].data = weeklyData;
            this.performanceChart.update('none');
        }

        // Update analytics page chart
        if (this.analyticsChart && analytics.subject_performance.length > 0) {
            const subjects = analytics.subject_performance.map(s => s.subject);
            const scores = analytics.subject_performance.map(s => s.average_score);
            const attempts = analytics.subject_performance.map(s => s.attempts);

            this.analyticsChart.data.labels = subjects;
            this.analyticsChart.data.datasets[0].data = scores;
            this.analyticsChart.data.datasets[1].data = attempts;
            this.analyticsChart.update('active');
        }
    }

    generateWeeklyData(recentActivity) {
        // Generate mock weekly performance data based on recent activity
        // In a real implementation, this would come from the backend
        const weeklyScores = [0, 0, 0, 0, 0, 0, 0];
        
        if (recentActivity.length > 0) {
            // Fill with sample data pattern based on recent performance
            const avgScore = recentActivity.reduce((sum, activity) => {
                const score = parseFloat(activity.score.replace('%', ''));
                return sum + score;
            }, 0) / recentActivity.length;

            // Generate realistic weekly progression
            for (let i = 0; i < 7; i++) {
                const variation = (Math.random() - 0.5) * 20; // ±10% variation
                weeklyScores[i] = Math.max(0, Math.min(100, avgScore + variation));
            }
        }
        
        return weeklyScores;
    }

    destroyCharts() {
        if (this.performanceChart) {
            this.performanceChart.destroy();
            this.performanceChart = null;
        }
        if (this.analyticsChart) {
            this.analyticsChart.destroy();
            this.analyticsChart = null;
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
        // Display performance summary
        const summaryContainer = document.getElementById('performanceSummary');
        if (summaryContainer && analytics.real_time_stats) {
            const stats = analytics.real_time_stats;
            summaryContainer.innerHTML = `
                <div class="bg-blue-50 p-4 rounded-lg">
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-medium text-blue-700">Total Quiz Attempts</span>
                        <span class="text-lg font-bold text-blue-900">${stats.total_attempts}</span>
                    </div>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-medium text-green-700">Overall Average</span>
                        <span class="text-lg font-bold text-green-900">${stats.average_score}%</span>
                    </div>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg">
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-medium text-purple-700">Weekly Average</span>
                        <span class="text-lg font-bold text-purple-900">${stats.weekly_average || 0}%</span>
                    </div>
                </div>
            `;
        }

        // Display recent trends
        const trendsContainer = document.getElementById('recentTrends');
        if (trendsContainer && analytics.recent_activity) {
            if (analytics.recent_activity.length > 0) {
                trendsContainer.innerHTML = analytics.recent_activity.map(activity => `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center">
                            <i class="fas fa-chart-line text-blue-500 mr-3"></i>
                            <div>
                                <div class="font-medium text-sm">${activity.subject}</div>
                                <div class="text-xs text-gray-500">${activity.date}</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-bold text-sm ${parseFloat(activity.score) >= 70 ? 'text-green-600' : 'text-red-600'}">${activity.score}</div>
                            <div class="text-xs text-gray-500">${activity.time}</div>
                        </div>
                    </div>
                `).join('');
            } else {
                trendsContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No recent activity to display trends</p>';
            }
        }

        // Update the chart with analytics data
        this.updateProgressChart(analytics);
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
