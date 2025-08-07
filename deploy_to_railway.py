#!/usr/bin/env python3
"""
Railway Deployment Helper Script
This script helps prepare the SmartTest Arena for Railway deployment
"""

import os
import sys
from enhanced_server import engine, Base

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

def initialize_cat_data():
    """Initialize CAT data for deployment"""
    import requests
    
    # Wait a moment for the server to start
    import time
    time.sleep(2)
    
    try:
        # Initialize CAT data
        response = requests.post("http://localhost:8001/initialize-cat")
        if response.status_code == 200:
            print("✅ CAT data initialized successfully!")
        else:
            print(f"⚠️ CAT initialization returned status {response.status_code}")
    except Exception as e:
        print(f"⚠️ Could not initialize CAT data: {e}")

def main():
    """Main deployment preparation function"""
    print("🚀 Preparing SmartTest Arena for Railway deployment...")
    
    # Create database tables
    create_tables()
    
    # Check if we're in development mode
    if os.getenv("RAILWAY_ENVIRONMENT") is None:
        print("📝 Development mode detected")
        print("💡 To deploy to Railway:")
        print("   1. Install Railway CLI: npm install -g @railway/cli")
        print("   2. Login: railway login")
        print("   3. Initialize project: railway init")
        print("   4. Deploy: railway up")
    else:
        print("🚀 Railway environment detected - ready for deployment!")

if __name__ == "__main__":
    main() 