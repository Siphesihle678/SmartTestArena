import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface AnalyticsData {
  totalAttempts: number;
  averageScore: number;
  streakDays: number;
  dailySubmissions: Record<string, number>;
  topicPerformance: Record<string, number>;
  trends: {
    scoreTrend: number[];
    attemptsTrend: number[];
    improvementRate: number;
  };
}

interface EnhancedDashboardProps {
  user: any;
  analytics: AnalyticsData;
  recentAttempts: any[];
  availableExams: any[];
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  user,
  analytics,
  recentAttempts,
  availableExams
}) => {
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    setExportLoading(true);
    try {
      const response = await api.get(`/analytics/export/${user.id}?format=${format}`);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report.${format}`;
      a.click();
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const dailySubmissionsData = {
    labels: Object.keys(analytics.dailySubmissions),
    datasets: [
      {
        label: 'Daily Submissions',
        data: Object.values(analytics.dailySubmissions),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const topicPerformanceData = {
    labels: Object.keys(analytics.topicPerformance),
    datasets: [
      {
        data: Object.values(analytics.topicPerformance),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
        borderWidth: 2,
      },
    ],
  };

  const scoreTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Score Trend',
        data: analytics.trends.scoreTrend,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Track your progress and improve your performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.totalAttempts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Streak Days</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.streakDays}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Improvement Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.trends.improvementRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Submissions Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Submissions</h3>
            <Bar 
              data={dailySubmissionsData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>

          {/* Topic Performance Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Topic Performance</h3>
            <Doughnut 
              data={topicPerformanceData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>

          {/* Score Trend Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Trend</h3>
            <Line 
              data={scoreTrendData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                  },
                },
              }}
            />
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentAttempts.slice(0, 5).map((attempt, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{attempt.exam?.title || 'Practice Test'}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(attempt.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{attempt.score}%</p>
                    <p className="text-sm text-gray-600">
                      {attempt.correct_answers}/{attempt.total_questions} correct
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => exportReport('pdf')}
              disabled={exportLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {exportLoading ? 'Exporting...' : 'Export PDF'}
            </button>
            <button
              onClick={() => exportReport('excel')}
              disabled={exportLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {exportLoading ? 'Exporting...' : 'Export Excel'}
            </button>
            <button
              onClick={() => exportReport('csv')}
              disabled={exportLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {exportLoading ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard; 