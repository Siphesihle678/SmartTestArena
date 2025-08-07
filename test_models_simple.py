#!/usr/bin/env python3
"""
Simple test for model imports
"""

print("Starting model import test...")

try:
    from models import Subject
    print("✅ Subject imported successfully")
except Exception as e:
    print(f"❌ Error importing Subject: {e}")

try:
    from models import Topic
    print("✅ Topic imported successfully")
except Exception as e:
    print(f"❌ Error importing Topic: {e}")

try:
    from models import Question
    print("✅ Question imported successfully")
except Exception as e:
    print(f"❌ Error importing Question: {e}")

print("Test completed.") 