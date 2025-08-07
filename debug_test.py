#!/usr/bin/env python3
"""
Debug test for backend issues
"""

import requests
import json

BASE_URL = "http://localhost:8001"

def test_signup():
    """Test user signup"""
    signup_data = {
        "name": "Debug User",
        "email": "debug@example.com",
        "password": "debugpass123",
        "is_tutor": True
    }
    response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
    print(f"Signup status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        return data["access_token"]
    else:
        print(f"Signup error: {response.text}")
        return None

def test_create_subject(token):
    """Test subject creation"""
    headers = {"Authorization": f"Bearer {token}"}
    subject_data = {
        "name": "Debug Subject",
        "description": "A debug subject",
        "grade_level": "Grade 10",
        "curriculum": "CAPS"
    }
    response = requests.post(f"{BASE_URL}/subjects", json=subject_data, headers=headers)
    print(f"Create subject status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        return data["id"]
    else:
        print(f"Create subject error: {response.text}")
        return None

def test_update_subject(token, subject_id):
    """Test subject update"""
    headers = {"Authorization": f"Bearer {token}"}
    update_data = {
        "name": "Updated Debug Subject",
        "description": "Updated description",
        "grade_level": "Grade 11",
        "curriculum": "CAPS"
    }
    response = requests.put(f"{BASE_URL}/subjects/{subject_id}", json=update_data, headers=headers)
    print(f"Update subject status: {response.status_code}")
    if response.status_code != 200:
        print(f"Update subject error: {response.text}")
    return response.status_code == 200

if __name__ == "__main__":
    print("🔍 Debugging backend issues...")
    
    # Test signup
    token = test_signup()
    if not token:
        print("❌ Signup failed")
        exit(1)
    
    # Test create subject
    subject_id = test_create_subject(token)
    if not subject_id:
        print("❌ Create subject failed")
        exit(1)
    
    # Test update subject
    success = test_update_subject(token, subject_id)
    if success:
        print("✅ All tests passed!")
    else:
        print("❌ Update subject failed")
