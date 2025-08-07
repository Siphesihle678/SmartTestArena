#!/usr/bin/env python3
"""
Simple database creation script
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

# Create Base
Base = declarative_base()

# Define models
class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text)
    grade_level = Column(String(50))
    curriculum = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

class Topic(Base):
    __tablename__ = "topics"
    
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    name = Column(String(100), index=True, nullable=False)
    description = Column(Text)
    weight = Column(Float, default=1.0)

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON)
    correct_answer = Column(String(255), nullable=False)
    difficulty = Column(String(20), default="medium")
    explanation = Column(Text)

def create_database():
    """Create the database and tables"""
    try:
        engine = create_engine("sqlite:///./smarttest_arena.db")
        Base.metadata.create_all(bind=engine)
        print("✅ Database and tables created successfully!")
        return engine
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return None

if __name__ == "__main__":
    print("🚀 Creating SmartTest Arena database...")
    engine = create_database()
    if engine:
        print("🎉 Database creation completed!")
    else:
        print("❌ Database creation failed!") 