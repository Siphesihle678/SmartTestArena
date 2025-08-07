#!/usr/bin/env python3
"""
Database migration script to create enhanced schema for SmartTest Arena
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models import Base, Subject, Topic, Question, User, StudentProfile, Analytics

# Database configuration
DATABASE_URL = "sqlite:///./smarttest_arena.db"

def create_tables():
    """Create all tables"""
    print("Starting create_tables function...")
    try:
        engine = create_engine(DATABASE_URL)
        print("Engine created successfully")
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully!")
        return engine
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return None

def create_initial_data(engine):
    """Create initial data for CAT subject"""
    print("Starting create_initial_data function...")
    try:
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        print("Database session created")
        
        # Create CAT subject
        cat_subject = Subject(
            name="Computer Applications Technology",
            description="CAT Grade 11 - Computer Applications Technology",
            grade_level="Grade 11",
            curriculum="CAPS"
        )
        db.add(cat_subject)
        db.commit()
        db.refresh(cat_subject)
        print(f"✅ Created subject: {cat_subject.name}")
        
        # Create topics
        topics_data = [
            {
                "name": "Systems Technologies",
                "description": "Computer systems and information processing cycle",
                "weight": 1.0
            },
            {
                "name": "Hardware & Software",
                "description": "Computer hardware components and software types",
                "weight": 1.0
            },
            {
                "name": "Social Implications",
                "description": "Social and ethical implications of ICT",
                "weight": 1.0
            },
            {
                "name": "Word Processing",
                "description": "Microsoft Word and document processing",
                "weight": 1.0
            },
            {
                "name": "Spreadsheets",
                "description": "Microsoft Excel and spreadsheet applications",
                "weight": 1.0
            },
            {
                "name": "Database",
                "description": "Microsoft Access and database management",
                "weight": 1.0
            }
        ]
        
        for topic_data in topics_data:
            topic = Topic(
                subject_id=cat_subject.id,
                name=topic_data["name"],
                description=topic_data["description"],
                weight=topic_data["weight"]
            )
            db.add(topic)
        
        db.commit()
        print("✅ Created all topics")
        
        # Create sample questions
        questions_data = [
            {
                "topic_name": "Systems Technologies",
                "question_text": "What are the four main components of the information processing cycle?",
                "options": [
                    "Input, Output, Processing, Storage",
                    "Input, Output, Processing, Communication",
                    "Input, Output, Storage, Communication",
                    "Input, Output, Processing, Storage, Communication"
                ],
                "correct_answer": "Input, Output, Processing, Storage",
                "difficulty": "medium",
                "explanation": "The four main components are Input, Output, Processing, and Storage."
            },
            {
                "topic_name": "Systems Technologies",
                "question_text": "Which of the following is NOT an input device?",
                "options": ["Touchscreen", "Scanner", "Printer", "Microphone"],
                "correct_answer": "Printer",
                "difficulty": "easy",
                "explanation": "A printer is an output device, not an input device."
            },
            {
                "topic_name": "Hardware & Software",
                "question_text": "What does SSD stand for?",
                "options": [
                    "Solid State Drive",
                    "Secondary Storage Device",
                    "System Storage Drive",
                    "Software Storage Device"
                ],
                "correct_answer": "Solid State Drive",
                "difficulty": "medium",
                "explanation": "SSD stands for Solid State Drive."
            },
            {
                "topic_name": "Word Processing",
                "question_text": "How do you create a bulleted list in Microsoft Word?",
                "options": [
                    "Press Tab",
                    "Press Enter",
                    "Press Ctrl + Shift + L",
                    "Press Ctrl + B"
                ],
                "correct_answer": "Press Ctrl + Shift + L",
                "difficulty": "medium",
                "explanation": "Ctrl + Shift + L creates a bulleted list in Word."
            },
            {
                "topic_name": "Spreadsheets",
                "question_text": "What does the SUMIF function do?",
                "options": [
                    "Adds all numbers in a range",
                    "Adds numbers that meet a specific condition",
                    "Counts cells with text",
                    "Finds the highest value"
                ],
                "correct_answer": "Adds numbers that meet a specific condition",
                "difficulty": "hard",
                "explanation": "SUMIF adds numbers in a range that meet a specified condition."
            }
        ]
        
        # Get topics for reference
        topics = db.query(Topic).filter(Topic.subject_id == cat_subject.id).all()
        topic_map = {topic.name: topic.id for topic in topics}
        print(f"Found {len(topics)} topics")
        
        for question_data in questions_data:
            topic_id = topic_map.get(question_data["topic_name"])
            if topic_id:
                question = Question(
                    topic_id=topic_id,
                    question_text=question_data["question_text"],
                    options=question_data["options"],
                    correct_answer=question_data["correct_answer"],
                    difficulty=question_data["difficulty"],
                    explanation=question_data["explanation"]
                )
                db.add(question)
        
        db.commit()
        print("✅ Created sample questions")
        
        db.close()
        print("✅ Initial data creation completed!")
        
    except Exception as e:
        print(f"❌ Error creating initial data: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        db.close()

def main():
    """Main migration function"""
    print("🚀 Starting SmartTest Arena database migration...")
    print("Current working directory:", os.getcwd())
    
    # Create tables
    engine = create_tables()
    if not engine:
        print("❌ Failed to create tables. Exiting.")
        return
    
    # Create initial data
    create_initial_data(engine)
    
    print("🎉 Database migration completed successfully!")

if __name__ == "__main__":
    main() 