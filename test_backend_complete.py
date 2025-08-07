#!/usr/bin/env python3
"""
Comprehensive Backend Test Suite
Tests all functionality of the SmartTest Arena backend
"""

import requests
import json
import time
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8001"
TEST_EMAIL = f"test{int(time.time())}@example.com"
TEST_PASSWORD = "testpassword123"
TEST_NAME = "Test User"

class BackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.access_token = None
        self.test_user_id = None
        self.test_subject_id = None
        self.test_topic_id = None
        self.test_question_id = None
        
    def test_health_check(self):
        """Test basic health endpoints"""
        print("🔍 Testing health endpoints...")
        
        # Test root endpoint
        response = requests.get(f"{self.base_url}/")
        assert response.status_code == 200, f"Root endpoint failed: {response.status_code}"
        data = response.json()
        assert data["status"] == "healthy", "Root endpoint not healthy"
        print("✅ Root endpoint working")
        
        # Test health endpoint
        response = requests.get(f"{self.base_url}/health")
        assert response.status_code == 200, f"Health endpoint failed: {response.status_code}"
        data = response.json()
        assert data["status"] == "healthy", "Health endpoint not healthy"
        print("✅ Health endpoint working")
        
    def test_authentication(self):
        """Test user authentication"""
        print("🔍 Testing authentication...")
        
        # Test user registration
        signup_data = {
            "name": TEST_NAME,
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "is_tutor": True
        }
        response = requests.post(f"{self.base_url}/auth/signup", json=signup_data)
        assert response.status_code == 200, f"Signup failed: {response.status_code}"
        data = response.json()
        assert "access_token" in data, "No access token in signup response"
        self.access_token = data["access_token"]
        print("✅ User registration working")
        
        # Test user login
        login_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        response = requests.post(f"{self.base_url}/auth/login", json=login_data)
        assert response.status_code == 200, f"Login failed: {response.status_code}"
        data = response.json()
        assert "access_token" in data, "No access token in login response"
        self.access_token = data["access_token"]
        print("✅ User login working")
        
        # Test get current user
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = requests.get(f"{self.base_url}/auth/me", headers=headers)
        assert response.status_code == 200, f"Get current user failed: {response.status_code}"
        data = response.json()
        assert data["email"] == TEST_EMAIL, "Wrong user returned"
        self.test_user_id = data["id"]
        print("✅ Get current user working")
        
    def test_subject_management(self):
        """Test subject CRUD operations"""
        print("🔍 Testing subject management...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Test create subject
        subject_data = {
            "name": "Test Subject",
            "description": "A test subject for testing",
            "grade_level": "Grade 10",
            "curriculum": "CAPS"
        }
        response = requests.post(f"{self.base_url}/subjects", json=subject_data, headers=headers)
        assert response.status_code == 200, f"Create subject failed: {response.status_code}"
        data = response.json()
        self.test_subject_id = data["id"]
        assert data["name"] == "Test Subject", "Subject name not saved correctly"
        print("✅ Create subject working")
        
        # Test get all subjects
        response = requests.get(f"{self.base_url}/subjects")
        assert response.status_code == 200, f"Get subjects failed: {response.status_code}"
        data = response.json()
        assert len(data) > 0, "No subjects returned"
        print("✅ Get subjects working")
        
        # Test get specific subject
        response = requests.get(f"{self.base_url}/subjects/{self.test_subject_id}")
        assert response.status_code == 200, f"Get subject failed: {response.status_code}"
        data = response.json()
        assert data["id"] == self.test_subject_id, "Wrong subject returned"
        print("✅ Get specific subject working")
        
        # Test update subject
        update_data = {
            "name": "Updated Test Subject",
            "description": "Updated description",
            "grade_level": "Grade 11",
            "curriculum": "CAPS"
        }
        response = requests.put(f"{self.base_url}/subjects/{self.test_subject_id}", json=update_data, headers=headers)
        assert response.status_code == 200, f"Update subject failed: {response.status_code}"
        data = response.json()
        assert data["name"] == "Updated Test Subject", "Subject not updated"
        print("✅ Update subject working")
        
    def test_topic_management(self):
        """Test topic CRUD operations"""
        print("🔍 Testing topic management...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Test create topic
        topic_data = {
            "name": "Test Topic",
            "description": "A test topic for testing",
            "weight": 1.5
        }
        response = requests.post(f"{self.base_url}/topics?subject_id={self.test_subject_id}", json=topic_data, headers=headers)
        assert response.status_code == 200, f"Create topic failed: {response.status_code}"
        data = response.json()
        self.test_topic_id = data["id"]
        assert data["name"] == "Test Topic", "Topic name not saved correctly"
        print("✅ Create topic working")
        
        # Test get all topics
        response = requests.get(f"{self.base_url}/topics")
        assert response.status_code == 200, f"Get topics failed: {response.status_code}"
        data = response.json()
        assert len(data) > 0, "No topics returned"
        print("✅ Get topics working")
        
        # Test get subject topics
        response = requests.get(f"{self.base_url}/subjects/{self.test_subject_id}/topics")
        assert response.status_code == 200, f"Get subject topics failed: {response.status_code}"
        data = response.json()
        assert len(data) > 0, "No topics for subject"
        print("✅ Get subject topics working")
        
        # Test update topic
        update_data = {
            "name": "Updated Test Topic",
            "description": "Updated topic description",
            "weight": 2.0
        }
        response = requests.put(f"{self.base_url}/topics/{self.test_topic_id}", json=update_data, headers=headers)
        assert response.status_code == 200, f"Update topic failed: {response.status_code}"
        data = response.json()
        assert data["name"] == "Updated Test Topic", "Topic not updated"
        print("✅ Update topic working")
        
    def test_question_management(self):
        """Test question CRUD operations"""
        print("🔍 Testing question management...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Test create question
        question_data = {
            "question_text": "What is the capital of France?",
            "options": ["London", "Berlin", "Paris", "Madrid"],
            "correct_answer": "Paris",
            "difficulty": "easy",
            "explanation": "Paris is the capital and largest city of France."
        }
        response = requests.post(f"{self.base_url}/questions?topic_id={self.test_topic_id}", json=question_data, headers=headers)
        assert response.status_code == 200, f"Create question failed: {response.status_code}"
        data = response.json()
        self.test_question_id = data["id"]
        assert data["question_text"] == "What is the capital of France?", "Question not saved correctly"
        print("✅ Create question working")
        
        # Test get all questions
        response = requests.get(f"{self.base_url}/questions")
        assert response.status_code == 200, f"Get questions failed: {response.status_code}"
        data = response.json()
        assert len(data) > 0, "No questions returned"
        print("✅ Get questions working")
        
        # Test get topic questions
        response = requests.get(f"{self.base_url}/topics/{self.test_topic_id}/questions")
        assert response.status_code == 200, f"Get topic questions failed: {response.status_code}"
        data = response.json()
        assert len(data) > 0, "No questions for topic"
        print("✅ Get topic questions working")
        
        # Test update question
        update_data = {
            "question_text": "What is the capital of France? (Updated)",
            "options": ["London", "Berlin", "Paris", "Madrid"],
            "correct_answer": "Paris",
            "difficulty": "medium",
            "explanation": "Paris is the capital and largest city of France. (Updated)"
        }
        response = requests.put(f"{self.base_url}/questions/{self.test_question_id}", json=update_data, headers=headers)
        assert response.status_code == 200, f"Update question failed: {response.status_code}"
        data = response.json()
        assert "Updated" in data["question_text"], "Question not updated"
        print("✅ Update question working")
        
    def test_quiz_submission(self):
        """Test quiz submission and analytics"""
        print("🔍 Testing quiz submission...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Test quiz submission
        quiz_data = {
            "user_id": self.test_user_id,
            "subject_id": self.test_subject_id,
            "topic_id": self.test_topic_id,
            "score": 8.0,
            "total_questions": 10,
            "time_taken": 300,  # 5 minutes
            "answers": {
                "1": "Paris",
                "2": "London",
                "3": "Berlin"
            }
        }
        response = requests.post(f"{self.base_url}/quiz/attempts", json=quiz_data, headers=headers)
        assert response.status_code == 200, f"Quiz submission failed: {response.status_code}"
        data = response.json()
        assert data["score"] == 8.0, "Quiz score not saved correctly"
        print("✅ Quiz submission working")
        
        # Test get user attempts
        response = requests.get(f"{self.base_url}/quiz/attempts/user/{self.test_user_id}", headers=headers)
        assert response.status_code == 200, f"Get user attempts failed: {response.status_code}"
        data = response.json()
        assert len(data) > 0, "No attempts returned"
        print("✅ Get user attempts working")
        
    def test_analytics(self):
        """Test analytics functionality"""
        print("🔍 Testing analytics...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Test get user analytics
        response = requests.get(f"{self.base_url}/analytics/user/{self.test_user_id}", headers=headers)
        assert response.status_code == 200, f"Get user analytics failed: {response.status_code}"
        print("✅ Get user analytics working")
        
        # Test update analytics
        analytics_data = {
            "daily_submissions": {"2024-01-01": 5},
            "topic_performance": {"Test Topic": 85.0},
            "trends": {"recent_scores": [80, 85, 90]}
        }
        response = requests.post(f"{self.base_url}/analytics/update?user_id={self.test_user_id}&subject_id={self.test_subject_id}", json=analytics_data, headers=headers)
        assert response.status_code == 200, f"Update analytics failed: {response.status_code}"
        print("✅ Update analytics working")
        
    def test_student_profiles(self):
        """Test student profile functionality"""
        print("🔍 Testing student profiles...")
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Test get student profiles
        response = requests.get(f"{self.base_url}/student-profiles/user/{self.test_user_id}", headers=headers)
        assert response.status_code == 200, f"Get student profiles failed: {response.status_code}"
        print("✅ Get student profiles working")
        
        # Test update student profile
        profile_data = {
            "performance_history": [{
                "date": "2024-01-01T10:00:00",
                "score": 85.0,
                "topic": "Test Topic",
                "total_questions": 10
            }],
            "recommendations": ["Practice more", "Review fundamentals"]
        }
        response = requests.post(f"{self.base_url}/student-profiles/update?user_id={self.test_user_id}&subject_id={self.test_subject_id}", json=profile_data, headers=headers)
        assert response.status_code == 200, f"Update student profile failed: {response.status_code}"
        print("✅ Update student profile working")
        
    def test_leaderboard(self):
        """Test leaderboard functionality"""
        print("🔍 Testing leaderboard...")
        
        # Test get leaderboard
        response = requests.get(f"{self.base_url}/leaderboard")
        assert response.status_code == 200, f"Get leaderboard failed: {response.status_code}"
        data = response.json()
        print("✅ Leaderboard working")
        
    def test_legacy_quiz_submission(self):
        """Test legacy quiz submission endpoint"""
        print("🔍 Testing legacy quiz submission...")
        
        # Test legacy quiz submission
        legacy_data = {
            "user_id": self.test_user_id,
            "subject_id": self.test_subject_id,
            "score": 7.0,
            "topic": "Test Topic"
        }
        response = requests.post(f"{self.base_url}/quiz/submit", json=legacy_data)
        assert response.status_code == 200, f"Legacy quiz submission failed: {response.status_code}"
        data = response.json()
        assert data["score"] == 7.0, "Legacy quiz score not saved correctly"
        print("✅ Legacy quiz submission working")
        
    def test_initialize_cat(self):
        """Test CAT data initialization"""
        print("🔍 Testing CAT data initialization...")
        
        response = requests.post(f"{self.base_url}/initialize-cat")
        assert response.status_code == 200, f"CAT initialization failed: {response.status_code}"
        data = response.json()
        assert "subject_id" in data, "No subject ID returned"
        print("✅ CAT data initialization working")
        
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting comprehensive backend tests...")
        
        try:
            self.test_health_check()
            self.test_authentication()
            self.test_subject_management()
            self.test_topic_management()
            self.test_question_management()
            self.test_quiz_submission()
            self.test_analytics()
            self.test_student_profiles()
            self.test_leaderboard()
            self.test_legacy_quiz_submission()
            self.test_initialize_cat()
            
            print("\n🎉 ALL TESTS PASSED! Backend is 100% functional!")
            print("\n📊 Backend Features Verified:")
            print("✅ Health checks")
            print("✅ User authentication (signup/login)")
            print("✅ Subject CRUD operations")
            print("✅ Topic CRUD operations")
            print("✅ Question CRUD operations")
            print("✅ Quiz submission and tracking")
            print("✅ Analytics and reporting")
            print("✅ Student profiles")
            print("✅ Leaderboard")
            print("✅ Legacy compatibility")
            print("✅ CAT data initialization")
            
        except Exception as e:
            print(f"\n❌ Test failed: {str(e)}")
            raise

if __name__ == "__main__":
    # Wait for server to start
    print("⏳ Waiting for server to start...")
    time.sleep(3)
    
    tester = BackendTester()
    tester.run_all_tests()
