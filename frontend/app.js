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
        this.subjectToDelete = null;
        
        // Quiz state management
        this.currentQuiz = null;
        this.quizQuestions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.markedForReview = new Set();
        this.quizStartTime = null;
        this.quizTimer = null;
        
        // Analytics state management
        this.analyticsCharts = {};
        this.analyticsData = null;
        this.currentTimeRange = 30;
        this.currentSubjectFilter = '';
        
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
        
        // Subject management
        document.getElementById('addSubjectBtn').addEventListener('click', () => this.showAddSubjectModal());
        document.getElementById('addSubjectForm').addEventListener('submit', (e) => this.handleAddSubject(e));
        document.getElementById('editSubjectForm').addEventListener('submit', (e) => this.handleEditSubject(e));
        
        // Modal controls
        document.getElementById('closeAddSubjectModal').addEventListener('click', () => this.hideAddSubjectModal());
        document.getElementById('cancelAddSubject').addEventListener('click', () => this.hideAddSubjectModal());
        document.getElementById('closeEditSubjectModal').addEventListener('click', () => this.hideEditSubjectModal());
        document.getElementById('cancelEditSubject').addEventListener('click', () => this.hideEditSubjectModal());
        document.getElementById('cancelDeleteSubject').addEventListener('click', () => this.hideDeleteSubjectModal());
        document.getElementById('confirmDeleteSubject').addEventListener('click', () => this.handleDeleteSubject());
        
        // Quiz management
        this.setupQuizEventListeners();
        
        // Analytics management
        this.setupAnalyticsEventListeners();
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
            card.className = 'bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition';
            card.innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-xl font-semibold text-gray-800">${subject.name}</h4>
                    <div class="flex items-center space-x-2">
                        <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">${subject.grade_level || 'All Grades'}</span>
                        ${this.currentUser && this.currentUser.is_tutor ? `
                            <div class="flex space-x-1">
                                <button onclick="smartTestArena.editSubject(${subject.id})" class="text-gray-400 hover:text-blue-600 transition" title="Edit Subject">
                                    <i class="fas fa-edit text-sm"></i>
                                </button>
                                <button onclick="smartTestArena.deleteSubject(${subject.id})" class="text-gray-400 hover:text-red-600 transition" title="Delete Subject">
                                    <i class="fas fa-trash text-sm"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <p class="text-gray-600 mb-4">${subject.description || 'No description available'}</p>
                <div class="flex justify-between text-sm text-gray-500 mb-4">
                    <span>Curriculum: ${subject.curriculum || 'N/A'}</span>
                    <span>Created: ${new Date(subject.created_at).toLocaleDateString()}</span>
                </div>
                <div class="flex space-x-2">
                    <button onclick="smartTestArena.viewTopics(${subject.id})" class="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition">
                        <i class="fas fa-list mr-1"></i> Topics
                    </button>
                    <button onclick="smartTestArena.startQuizForSubject(${subject.id})" class="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition">
                        <i class="fas fa-play mr-1"></i> Quiz
                    </button>
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

    // Subject Management Methods
    showAddSubjectModal() {
        if (!this.currentUser || !this.currentUser.is_tutor) {
            this.showToast('Only tutors can add subjects', 'error');
            return;
        }
        document.getElementById('addSubjectModal').classList.remove('hidden');
        document.getElementById('subjectName').focus();
    }

    hideAddSubjectModal() {
        document.getElementById('addSubjectModal').classList.add('hidden');
        document.getElementById('addSubjectForm').reset();
    }

    showEditSubjectModal() {
        document.getElementById('editSubjectModal').classList.remove('hidden');
        document.getElementById('editSubjectName').focus();
    }

    hideEditSubjectModal() {
        document.getElementById('editSubjectModal').classList.add('hidden');
        document.getElementById('editSubjectForm').reset();
    }

    showDeleteSubjectModal() {
        document.getElementById('deleteSubjectModal').classList.remove('hidden');
    }

    hideDeleteSubjectModal() {
        document.getElementById('deleteSubjectModal').classList.add('hidden');
        this.subjectToDelete = null;
    }

    async handleAddSubject(e) {
        e.preventDefault();
        
        if (!this.currentUser || !this.currentUser.is_tutor) {
            this.showToast('Only tutors can add subjects', 'error');
            return;
        }

        const formData = new FormData(e.target);
        const subjectData = {
            name: formData.get('name'),
            description: formData.get('description') || null,
            grade_level: formData.get('grade_level') || null,
            curriculum: formData.get('curriculum') || null
        };

        try {
            await this.apiRequest('/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subjectData)
            });
            
            this.showToast('Subject added successfully!', 'success');
            this.hideAddSubjectModal();
            await this.getSubjects(); // Refresh the subjects list
        } catch (error) {
            console.error('Failed to add subject:', error);
            this.showToast('Failed to add subject. Please try again.', 'error');
        }
    }

    async editSubject(subjectId) {
        if (!this.currentUser || !this.currentUser.is_tutor) {
            this.showToast('Only tutors can edit subjects', 'error');
            return;
        }

        try {
            const subject = await this.apiRequest(`/subjects/${subjectId}`);
            
            // Populate the edit form
            document.getElementById('editSubjectId').value = subject.id;
            document.getElementById('editSubjectName').value = subject.name;
            document.getElementById('editSubjectDescription').value = subject.description || '';
            document.getElementById('editSubjectGradeLevel').value = subject.grade_level || '';
            document.getElementById('editSubjectCurriculum').value = subject.curriculum || '';
            
            this.showEditSubjectModal();
        } catch (error) {
            console.error('Failed to load subject for editing:', error);
            this.showToast('Failed to load subject details', 'error');
        }
    }

    async handleEditSubject(e) {
        e.preventDefault();
        
        if (!this.currentUser || !this.currentUser.is_tutor) {
            this.showToast('Only tutors can edit subjects', 'error');
            return;
        }

        const formData = new FormData(e.target);
        const subjectId = formData.get('id');
        const subjectData = {
            name: formData.get('name'),
            description: formData.get('description') || null,
            grade_level: formData.get('grade_level') || null,
            curriculum: formData.get('curriculum') || null
        };

        try {
            await this.apiRequest(`/subjects/${subjectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subjectData)
            });
            
            this.showToast('Subject updated successfully!', 'success');
            this.hideEditSubjectModal();
            await this.getSubjects(); // Refresh the subjects list
        } catch (error) {
            console.error('Failed to update subject:', error);
            this.showToast('Failed to update subject. Please try again.', 'error');
        }
    }

    deleteSubject(subjectId) {
        if (!this.currentUser || !this.currentUser.is_tutor) {
            this.showToast('Only tutors can delete subjects', 'error');
            return;
        }

        this.subjectToDelete = subjectId;
        this.showDeleteSubjectModal();
    }

    async handleDeleteSubject() {
        if (!this.subjectToDelete || !this.currentUser || !this.currentUser.is_tutor) {
            return;
        }

        try {
            await this.apiRequest(`/subjects/${this.subjectToDelete}`, {
                method: 'DELETE'
            });
            
            this.showToast('Subject deleted successfully!', 'success');
            this.hideDeleteSubjectModal();
            await this.getSubjects(); // Refresh the subjects list
        } catch (error) {
            console.error('Failed to delete subject:', error);
            this.showToast('Failed to delete subject. Please try again.', 'error');
        }
    }

    // Subject action methods
    async viewTopics(subjectId) {
        try {
            const topics = await this.apiRequest(`/subjects/${subjectId}/topics`);
            this.showToast(`Found ${topics.length} topics for this subject`, 'info');
            // TODO: Implement topic viewing UI
        } catch (error) {
            console.error('Failed to load topics:', error);
            this.showToast('Failed to load topics', 'error');
        }
    }

    startQuizForSubject(subjectId) {
        this.showQuizSection();
        // Pre-select the subject in quiz setup
        document.getElementById('quizSubject').value = subjectId;
        this.loadTopicsForQuiz(subjectId);
        this.showToast('Quiz section opened', 'info');
    }

    // Quiz System Implementation
    setupQuizEventListeners() {
        // Quiz setup listeners
        document.getElementById('quizSubject').addEventListener('change', (e) => {
            const subjectId = e.target.value;
            if (subjectId) {
                this.loadTopicsForQuiz(subjectId);
            } else {
                this.clearTopicsDropdown();
            }
        });

        document.getElementById('quizTopic').addEventListener('change', () => {
            this.validateQuizSetup();
        });

        document.getElementById('startQuizBtn').addEventListener('click', () => {
            this.startQuiz();
        });

        document.getElementById('manageQuestionsBtn').addEventListener('click', () => {
            this.showQuestionManagement();
        });

        // Quiz taking listeners
        document.getElementById('prevQuestionBtn').addEventListener('click', () => {
            this.goToPreviousQuestion();
        });

        document.getElementById('nextQuestionBtn').addEventListener('click', () => {
            this.goToNextQuestion();
        });

        document.getElementById('markForReviewBtn').addEventListener('click', () => {
            this.toggleMarkForReview();
        });

        document.getElementById('submitQuizBtn').addEventListener('click', () => {
            this.confirmSubmitQuiz();
        });

        // Quiz results listeners
        document.getElementById('reviewAnswersBtn').addEventListener('click', () => {
            this.reviewAnswers();
        });

        document.getElementById('retakeQuizBtn').addEventListener('click', () => {
            this.retakeQuiz();
        });

        document.getElementById('backToQuizSetupBtn').addEventListener('click', () => {
            this.backToQuizSetup();
        });

        // Question management listeners
        document.getElementById('closeQuestionModal').addEventListener('click', () => {
            this.hideQuestionManagement();
        });

        document.getElementById('addQuestionBtn').addEventListener('click', () => {
            this.showAddQuestionForm();
        });
    }

    // Quiz Setup Methods
    async loadSubjectsForQuiz() {
        try {
            const subjects = await this.getSubjects();
            const dropdown = document.getElementById('quizSubject');
            dropdown.innerHTML = '<option value="">Select a subject</option>';
            
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                dropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load subjects for quiz:', error);
            this.showToast('Failed to load subjects', 'error');
        }
    }

    async loadTopicsForQuiz(subjectId) {
        try {
            const topics = await this.apiRequest(`/subjects/${subjectId}/topics`);
            const dropdown = document.getElementById('quizTopic');
            dropdown.innerHTML = '<option value="">Select a topic</option>';
            dropdown.disabled = false;
            
            topics.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic.id;
                option.textContent = topic.name;
                dropdown.appendChild(option);
            });
            
            this.validateQuizSetup();
        } catch (error) {
            console.error('Failed to load topics:', error);
            this.showToast('Failed to load topics', 'error');
            this.clearTopicsDropdown();
        }
    }

    clearTopicsDropdown() {
        const dropdown = document.getElementById('quizTopic');
        dropdown.innerHTML = '<option value="">Select a topic</option>';
        dropdown.disabled = true;
        this.validateQuizSetup();
    }

    validateQuizSetup() {
        const subjectId = document.getElementById('quizSubject').value;
        const topicId = document.getElementById('quizTopic').value;
        const startBtn = document.getElementById('startQuizBtn');
        
        startBtn.disabled = !subjectId || !topicId;
    }

    // Quiz Execution Methods
    async startQuiz() {
        const subjectId = parseInt(document.getElementById('quizSubject').value);
        const topicId = parseInt(document.getElementById('quizTopic').value);
        const questionCount = parseInt(document.getElementById('quizQuestionCount').value);
        const difficulty = document.getElementById('quizDifficulty').value;

        if (!subjectId || !topicId) {
            this.showToast('Please select both subject and topic', 'error');
            return;
        }

        try {
            // Load questions for the selected topic
            let questions = await this.apiRequest(`/topics/${topicId}/questions`);
            
            // Filter by difficulty if specified
            if (difficulty) {
                questions = questions.filter(q => q.difficulty === difficulty);
            }

            if (questions.length === 0) {
                this.showToast('No questions available for the selected criteria', 'error');
                return;
            }

            // Randomly select questions up to the requested count
            if (questions.length > questionCount) {
                questions = this.shuffleArray(questions).slice(0, questionCount);
            }

            // Initialize quiz state
            this.currentQuiz = {
                subjectId,
                topicId,
                subjectName: document.getElementById('quizSubject').selectedOptions[0].text,
                topicName: document.getElementById('quizTopic').selectedOptions[0].text
            };
            this.quizQuestions = questions;
            this.currentQuestionIndex = 0;
            this.userAnswers = {};
            this.markedForReview = new Set();
            this.quizStartTime = Date.now();

            // Start the quiz interface
            this.showQuizTaking();
            this.displayQuestion();
            this.startQuizTimer();
            this.generateQuestionNavigator();

            this.showToast('Quiz started! Good luck!', 'success');
        } catch (error) {
            console.error('Failed to start quiz:', error);
            this.showToast('Failed to start quiz. Please try again.', 'error');
        }
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Override showQuizSection to load subjects when quiz section is shown
    showQuizSection() {
        this.showSection('quiz');
        this.loadSubjectsForQuiz();
        this.backToQuizSetup(); // Ensure we start from setup
    }

    // Placeholder methods for quiz functionality
    showQuizTaking() { this.showToast('Quiz taking interface - coming soon!', 'info'); }
    displayQuestion() { }
    startQuizTimer() { }
    generateQuestionNavigator() { }
    goToPreviousQuestion() { }
    goToNextQuestion() { }
    toggleMarkForReview() { }
    confirmSubmitQuiz() { }
    submitQuiz() { }
    showQuizResults() { }
    reviewAnswers() { }
    retakeQuiz() { this.backToQuizSetup(); }
    backToQuizSetup() {
        document.getElementById('quizTaking').classList.add('hidden');
        document.getElementById('quizResults').classList.add('hidden');
        document.getElementById('quizSetup').classList.remove('hidden');
    }
    showQuestionManagement() { this.showToast('Question management - coming soon!', 'info'); }
    hideQuestionManagement() { }
    loadQuestionsForManagement() { }
    showAddQuestionForm() { }
    editQuestion() { }
    deleteQuestion() { }

    // Analytics System Implementation
    setupAnalyticsEventListeners() {
        // Time range and filter controls
        document.getElementById('analyticsTimeRange').addEventListener('change', (e) => {
            this.currentTimeRange = parseInt(e.target.value);
            this.loadAnalyticsData();
        });

        document.getElementById('analyticsSubjectFilter').addEventListener('change', (e) => {
            this.currentSubjectFilter = e.target.value;
            this.loadAnalyticsData();
        });

        // Chart type controls
        document.getElementById('performanceChartType').addEventListener('click', (e) => {
            this.toggleChartType(e.target);
        });

        // Export functionality
        document.getElementById('exportAnalyticsBtn').addEventListener('click', () => {
            this.showExportModal();
        });

        document.getElementById('closeExportModal').addEventListener('click', () => {
            this.hideExportModal();
        });

        document.getElementById('cancelExport').addEventListener('click', () => {
            this.hideExportModal();
        });

        document.getElementById('confirmExport').addEventListener('click', () => {
            this.exportAnalyticsData();
        });

        // Report generation
        document.getElementById('generateReportBtn').addEventListener('click', () => {
            this.generateDetailedReport();
        });

        document.getElementById('exportReportBtn').addEventListener('click', () => {
            this.exportReportAsPDF();
        });
    }

    async loadAnalyticsData() {
        if (!this.currentUser) return;

        try {
            this.showLoading();
            
            // Load comprehensive analytics data
            const analytics = await this.apiRequest(`/analytics/dashboard/${this.currentUser.id}`);
            this.analyticsData = analytics;
            
            // Update all analytics components
            this.updatePerformanceMetrics(analytics);
            this.updateProgressTracking(analytics);
            this.updateRecentActivity(analytics);
            this.initializeAnalyticsCharts(analytics);
            
            this.hideLoading();
        } catch (error) {
            console.error('Failed to load analytics data:', error);
            this.showToast('Failed to load analytics data', 'error');
            this.hideLoading();
        }
    }

    updatePerformanceMetrics(analytics) {
        const stats = analytics.real_time_stats;
        
        document.getElementById('avgScoreMetric').textContent = `${stats.average_score}%`;
        document.getElementById('totalAttemptsMetric').textContent = stats.total_attempts;
        
        // Calculate study time (mock data for now)
        const studyTimeHours = Math.floor(stats.total_attempts * 0.5); // 30 min per attempt
        document.getElementById('studyTimeMetric').textContent = `${studyTimeHours}h`;
        
        // Calculate improvement rate
        const improvementRate = analytics.weekly_progress.improvement === 'positive' ? 15 : 0;
        document.getElementById('improvementRateMetric').textContent = `${improvementRate}%`;
    }

    updateProgressTracking(analytics) {
        const stats = analytics.real_time_stats;
        const weeklyProgress = analytics.weekly_progress;
        
        // Weekly goal progress
        const weeklyGoal = 5;
        const weeklyCompleted = weeklyProgress.attempts_count;
        const weeklyPercentage = Math.min((weeklyCompleted / weeklyGoal) * 100, 100);
        
        document.getElementById('weeklyGoalProgress').textContent = `${weeklyCompleted}/${weeklyGoal}`;
        document.getElementById('weeklyGoalBar').style.width = `${weeklyPercentage}%`;
        
        // Monthly target progress
        const monthlyTarget = 20;
        const monthlyCompleted = stats.total_attempts;
        const monthlyPercentage = Math.min((monthlyCompleted / monthlyTarget) * 100, 100);
        
        document.getElementById('monthlyTargetProgress').textContent = `${monthlyCompleted}/${monthlyTarget}`;
        document.getElementById('monthlyTargetBar').style.width = `${monthlyPercentage}%`;
        
        // Streak calculation (mock data)
        const currentStreak = Math.min(stats.today_attempts + 2, 7);
        const bestStreak = Math.max(currentStreak, 12);
        
        document.getElementById('currentStreak').textContent = `${currentStreak} days`;
        document.getElementById('bestStreak').textContent = `${bestStreak} days`;
    }

    updateRecentActivity(analytics) {
        const container = document.getElementById('recentActivityList');
        container.innerHTML = '';
        
        if (analytics.recent_activity.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No recent activity</p>';
            return;
        }
        
        analytics.recent_activity.forEach(activity => {
            const activityDiv = document.createElement('div');
            activityDiv.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
            activityDiv.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-question-circle text-blue-500 mr-3"></i>
                    <div>
                        <div class="font-medium text-sm">${activity.subject}</div>
                        <div class="text-xs text-gray-500">${activity.date} at ${activity.time}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-bold text-sm ${parseFloat(activity.score) >= 70 ? 'text-green-600' : 'text-red-600'}">${activity.score}</div>
                </div>
            `;
            container.appendChild(activityDiv);
        });
    }

    initializeAnalyticsCharts(analytics) {
        this.createOverallPerformanceChart(analytics);
        this.createSubjectComparisonChart(analytics);
    }

    createOverallPerformanceChart(analytics) {
        const ctx = document.getElementById('overallPerformanceChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.analyticsCharts.overallPerformance) {
            this.analyticsCharts.overallPerformance.destroy();
        }

        // Generate sample data for the time range
        const days = this.currentTimeRange;
        const labels = [];
        const data = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            // Generate realistic performance data
            const baseScore = analytics.real_time_stats.average_score;
            const variation = (Math.random() - 0.5) * 20;
            data.push(Math.max(0, Math.min(100, baseScore + variation));
        }

        this.analyticsCharts.overallPerformance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Performance Score',
                    data: data,
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
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    createSubjectComparisonChart(analytics) {
        const ctx = document.getElementById('subjectComparisonChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.analyticsCharts.subjectComparison) {
            this.analyticsCharts.subjectComparison.destroy();
        }

        const subjects = analytics.subject_performance;
        const labels = subjects.map(s => s.subject);
        const scores = subjects.map(s => s.average_score);
        const attempts = subjects.map(s => s.attempts);

        this.analyticsCharts.subjectComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Score (%)',
                    data: scores,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: '#3B82F6',
                    borderWidth: 1
                }, {
                    label: 'Attempts',
                    data: attempts,
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
                            text: 'Score (%)'
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
                            text: 'Attempts'
                        },
                        min: 0,
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    toggleChartType(button) {
        const buttons = document.querySelectorAll('[data-type]');
        buttons.forEach(btn => {
            btn.className = 'text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded';
        });
        button.className = 'text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded';
        
        const chartType = button.getAttribute('data-type');
        if (this.analyticsCharts.overallPerformance) {
            this.analyticsCharts.overallPerformance.config.type = chartType;
            this.analyticsCharts.overallPerformance.update();
        }
    }

    showExportModal() {
        document.getElementById('exportModal').classList.remove('hidden');
    }

    hideExportModal() {
        document.getElementById('exportModal').classList.add('hidden');
    }

    async exportAnalyticsData() {
        const format = document.querySelector('input[name="exportFormat"]:checked').value;
        const dataRange = document.getElementById('exportDataRange').value;
        const includeQuizzes = document.getElementById('exportQuizzes').checked;
        const includePerformance = document.getElementById('exportPerformance').checked;
        const includeProgress = document.getElementById('exportProgress').checked;
        const includeCharts = document.getElementById('exportCharts').checked;

        try {
            this.showToast('Preparing export...', 'info');
            
            // Prepare export data
            const exportData = {
                format: format,
                dataRange: dataRange,
                includes: {
                    quizzes: includeQuizzes,
                    performance: includePerformance,
                    progress: includeProgress,
                    charts: includeCharts
                },
                data: this.analyticsData
            };

            // Simulate export process
            setTimeout(() => {
                this.downloadExportData(exportData, format);
                this.hideExportModal();
                this.showToast('Export completed successfully!', 'success');
            }, 2000);

        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Export failed. Please try again.', 'error');
        }
    }

    downloadExportData(data, format) {
        let content, filename, mimeType;

        if (format === 'csv') {
            content = this.convertToCSV(data);
            filename = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv';
        } else if (format === 'json') {
            content = JSON.stringify(data, null, 2);
            filename = `analytics_${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
        } else {
            // PDF would require a library like jsPDF
            this.showToast('PDF export coming soon!', 'info');
            return;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    convertToCSV(data) {
        const analytics = data.data;
        let csv = 'Subject,Average Score,Attempts,Last Activity\n';
        
        if (analytics.subject_performance) {
            analytics.subject_performance.forEach(subject => {
                csv += `${subject.subject},${subject.average_score}%,${subject.attempts},${new Date().toLocaleDateString()}\n`;
            });
        }
        
        return csv;
    }

    async generateDetailedReport() {
        const reportType = document.getElementById('reportType').value;
        const dateFrom = document.getElementById('reportDateFrom').value;
        const dateTo = document.getElementById('reportDateTo').value;
        const include = document.getElementById('reportInclude').value;

        try {
            this.showLoading();
            
            // Generate report content based on type
            const reportContent = await this.generateReportContent(reportType, dateFrom, dateTo, include);
            
            document.getElementById('reportContent').innerHTML = reportContent;
            
            this.hideLoading();
            this.showToast('Report generated successfully!', 'success');
        } catch (error) {
            console.error('Report generation failed:', error);
            this.showToast('Failed to generate report', 'error');
            this.hideLoading();
        }
    }

    async generateReportContent(type, dateFrom, dateTo, include) {
        // This would typically call backend endpoints for detailed data
        // For now, we'll generate sample report content
        
        let content = '<div class="space-y-4">';
        
        switch (type) {
            case 'performance':
                content += this.generatePerformanceReport();
                break;
            case 'progress':
                content += this.generateProgressReport();
                break;
            case 'comparison':
                content += this.generateComparisonReport();
                break;
            case 'detailed':
                content += this.generateDetailedAnalysisReport();
                break;
        }
        
        content += '</div>';
        return content;
    }

    generatePerformanceReport() {
        return `
            <div class="bg-blue-50 p-4 rounded-lg">
                <h5 class="font-semibold text-blue-900 mb-2">Performance Report</h5>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="font-medium">Overall Average:</span>
                        <span class="ml-2">${this.analyticsData?.real_time_stats?.average_score || 0}%</span>
                    </div>
                    <div>
                        <span class="font-medium">Total Attempts:</span>
                        <span class="ml-2">${this.analyticsData?.real_time_stats?.total_attempts || 0}</span>
                    </div>
                    <div>
                        <span class="font-medium">Weekly Average:</span>
                        <span class="ml-2">${this.analyticsData?.weekly_progress?.average_score || 0}%</span>
                    </div>
                    <div>
                        <span class="font-medium">Improvement Rate:</span>
                        <span class="ml-2">${this.analyticsData?.weekly_progress?.improvement === 'positive' ? '15%' : '0%'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    generateProgressReport() {
        return `
            <div class="bg-green-50 p-4 rounded-lg">
                <h5 class="font-semibold text-green-900 mb-2">Progress Report</h5>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span>Weekly Goal Progress:</span>
                        <span>${this.analyticsData?.weekly_progress?.attempts_count || 0}/5</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Monthly Target Progress:</span>
                        <span>${this.analyticsData?.real_time_stats?.total_attempts || 0}/20</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Current Streak:</span>
                        <span>${Math.min((this.analyticsData?.real_time_stats?.today_attempts || 0) + 2, 7)} days</span>
                    </div>
                </div>
            </div>
        `;
    }

    generateComparisonReport() {
        if (!this.analyticsData?.subject_performance) {
            return '<p class="text-gray-500">No comparison data available</p>';
        }

        let content = '<div class="bg-purple-50 p-4 rounded-lg"><h5 class="font-semibold text-purple-900 mb-2">Subject Comparison</h5><div class="space-y-2">';
        
        this.analyticsData.subject_performance.forEach(subject => {
            content += `
                <div class="flex justify-between items-center">
                    <span class="font-medium">${subject.subject}:</span>
                    <span>${subject.average_score}% (${subject.attempts} attempts)</span>
                </div>
            `;
        });
        
        content += '</div></div>';
        return content;
    }

    generateDetailedAnalysisReport() {
        return `
            <div class="space-y-4">
                ${this.generatePerformanceReport()}
                ${this.generateProgressReport()}
                ${this.generateComparisonReport()}
                <div class="bg-orange-50 p-4 rounded-lg">
                    <h5 class="font-semibold text-orange-900 mb-2">Recommendations</h5>
                    <ul class="text-sm space-y-1">
                        <li>• Focus on subjects with lower performance scores</li>
                        <li>• Increase study time for challenging topics</li>
                        <li>• Set daily study goals to improve consistency</li>
                        <li>• Review incorrect answers to identify knowledge gaps</li>
                    </ul>
                </div>
            </div>
        `;
    }

    exportReportAsPDF() {
        // This would require a PDF generation library
        this.showToast('PDF export feature coming soon!', 'info');
    }

    // Override showAnalyticsSection to load analytics data
    showAnalyticsSection() {
        this.showSection('analytics');
        this.loadAnalyticsData();
        this.loadSubjectsForAnalytics();
    }

    async loadSubjectsForAnalytics() {
        try {
            const subjects = await this.getSubjects();
            const dropdown = document.getElementById('analyticsSubjectFilter');
            dropdown.innerHTML = '<option value="">All Subjects</option>';
            
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                dropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load subjects for analytics:', error);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.smartTestArena = new SmartTestArena();
});
