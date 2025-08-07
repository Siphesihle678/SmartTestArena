#!/usr/bin/env python3
"""
Simple Database Migration Script
"""

import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from sqlalchemy import create_engine, text
    from core.database import SessionLocal
    from models import (
        User, Exam, Attempt, 
        Subject, Topic, Question, 
        StudentProfile, Analytics
    )
    from core.config import DATABASE_URL
    import logging

    # Configure logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    def create_enhanced_schema():
        """Create the enhanced database schema with new tables."""
        
        engine = create_engine(DATABASE_URL)
        
        try:
            # Create all tables
            logger.info("Creating enhanced database schema...")
            
            # Import all models to ensure they're registered
            from models import Base
            Base.metadata.create_all(bind=engine)
            
            logger.info("✅ Enhanced database schema created successfully!")
            
            # Verify tables were created
            with engine.connect() as conn:
                result = conn.execute(text("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    ORDER BY table_name
                """))
                
                tables = [row[0] for row in result]
                logger.info(f"📋 Available tables: {tables}")
                
                # Check for new tables
                new_tables = ['subjects', 'topics', 'questions', 'student_profiles', 'analytics']
                for table in new_tables:
                    if table in tables:
                        logger.info(f"✅ Table '{table}' created successfully")
                    else:
                        logger.warning(f"⚠️ Table '{table}' not found")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error creating enhanced schema: {e}")
            return False

    def create_initial_data():
        """Create initial data for the enhanced schema."""
        
        db = SessionLocal()
        
        try:
            logger.info("Creating initial data...")
            
            # Create CAT subject
            cat_subject = Subject(
                name="Computer Applications Technology",
                description="CAT Grade 11 curriculum covering computer applications and technology",
                grade_level="Grade 11",
                curriculum="CAPS"
            )
            db.add(cat_subject)
            db.commit()
            db.refresh(cat_subject)
            logger.info(f"✅ Created CAT subject with ID: {cat_subject.id}")
            
            # Create CAT topics
            cat_topics = [
                Topic(name="Systems Technologies", subject_id=cat_subject.id, description="Information processing cycle and system components"),
                Topic(name="Hardware & Software", subject_id=cat_subject.id, description="Computer hardware and software components"),
                Topic(name="Social Implications", subject_id=cat_subject.id, description="Social and ethical implications of technology"),
                Topic(name="Word Processing", subject_id=cat_subject.id, description="Microsoft Word and document processing"),
                Topic(name="Spreadsheets", subject_id=cat_subject.id, description="Microsoft Excel and data analysis"),
                Topic(name="Database", subject_id=cat_subject.id, description="Microsoft Access and database management")
            ]
            
            for topic in cat_topics:
                db.add(topic)
            
            db.commit()
            logger.info(f"✅ Created {len(cat_topics)} CAT topics")
            
            # Create sample questions for CAT
            sample_questions = [
                {
                    "topic_id": cat_topics[0].id,  # Systems Technologies
                    "question_text": "What are the four main components of the information processing cycle?",
                    "options": [
                        "Input, Output, Processing, Storage",
                        "Input, Output, Processing, Communication",
                        "Input, Output, Storage, Communication",
                        "Input, Output, Processing, Storage, Communication"
                    ],
                    "correct_answer": "Input, Output, Processing, Storage",
                    "difficulty": "easy",
                    "explanation": "The four main components are Input, Output, Processing, and Storage."
                },
                {
                    "topic_id": cat_topics[1].id,  # Hardware & Software
                    "question_text": "Which of the following is NOT an input device?",
                    "options": ["Touchscreen", "Scanner", "Printer", "Microphone"],
                    "correct_answer": "Printer",
                    "difficulty": "easy",
                    "explanation": "A printer is an output device, not an input device."
                },
                {
                    "topic_id": cat_topics[2].id,  # Social Implications
                    "question_text": "What is BYOD?",
                    "options": [
                        "Bring Your Own Device",
                        "Buy Your Own Data",
                        "Build Your Own Database",
                        "Backup Your Own Documents"
                    ],
                    "correct_answer": "Bring Your Own Device",
                    "difficulty": "medium",
                    "explanation": "BYOD stands for Bring Your Own Device, a policy allowing employees to use personal devices for work."
                }
            ]
            
            for question_data in sample_questions:
                question = Question(**question_data)
                db.add(question)
            
            db.commit()
            logger.info(f"✅ Created {len(sample_questions)} sample CAT questions")
            
            logger.info("✅ Initial data created successfully!")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error creating initial data: {e}")
            db.rollback()
            return False
        finally:
            db.close()

    def main():
        """Main function to run the database migration."""
        
        print("🚀 SmartTest Arena Enhanced Schema Migration")
        print("=" * 50)
        
        # Step 1: Create enhanced schema
        print("\n📋 Step 1: Creating enhanced database schema...")
        if create_enhanced_schema():
            print("✅ Enhanced schema created successfully!")
        else:
            print("❌ Failed to create enhanced schema")
            return
        
        # Step 2: Create initial data
        print("\n📋 Step 2: Creating initial data...")
        if create_initial_data():
            print("✅ Initial data created successfully!")
        else:
            print("❌ Failed to create initial data")
            return
        
        print("\n🎉 Migration completed successfully!")
        print("📊 Enhanced SmartTest Arena is ready with CAT features!")

    if __name__ == "__main__":
        main()

except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please ensure all dependencies are installed and models are properly configured.")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc() 