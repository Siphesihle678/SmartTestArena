#!/usr/bin/env python3
"""
Simple health check for Railway deployment
"""
import requests
import sys
import time

def check_health():
    try:
        # Wait a bit for server to start
        time.sleep(5)
        
        # Check if server responds
        response = requests.get("http://localhost:8001/health", timeout=10)
        if response.status_code == 200:
            print("✅ Server is healthy!")
            return True
        else:
            print(f"❌ Server returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

if __name__ == "__main__":
    success = check_health()
    sys.exit(0 if success else 1)
