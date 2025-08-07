#!/usr/bin/env python3
"""
Test script to verify model imports
"""

try:
    from models import Subject, Topic, Question, StudentProfile, Analytics
    print("All models imported successfully!")
    
    # Test creating instances
    print("Testing model creation...")
    
    # Test Subject
    subject = Subject(name="Computer Applications Technology", description="CAT Grade 11", grade_level="Grade 11", curriculum="CAPS")
    print(f"Subject created: {subject.name}")
    
    # Test Topic
    topic = Topic(name="Systems Technologies", description="Computer systems and information processing", weight=1.0)
    print(f"Topic created: {topic.name}")
    
    # Test Question
    question = Question(question_text="What are the four main components of the information processing cycle?", 
                      options=["Input, Output, Processing, Storage", "Input, Output, Processing, Communication", 
                              "Input, Output, Storage, Communication", "Input, Output, Processing, Storage, Communication"],
                      correct_answer="Input, Output, Processing, Storage",
                      difficulty="medium",
                      explanation="The four main components are Input, Output, Processing, and Storage.")
    print(f"Question created: {question.question_text[:50]}...")
    
    print("All model tests passed!")
    
except ImportError as e:
    print(f"Import error: {e}")
except Exception as e:
    print(f"Error: {e}") 