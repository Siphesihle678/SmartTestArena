#!/usr/bin/env python3
"""
Simple test to check if the migration script can run
"""

print("Starting simple test...")

try:
    import sys
    print(f"Python version: {sys.version}")
    
    import sqlalchemy
    print(f"SQLAlchemy version: {sqlalchemy.__version__}")
    
    print("✅ Basic imports successful")
    
except Exception as e:
    print(f"❌ Error: {e}")

print("Test completed.") 