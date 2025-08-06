#!/usr/bin/env python3
"""
Enhanced SmartTest Arena Server with CAT Quiz Integration
Deployed to Railway - Updated for production
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import json

# Create Base
Base = declarative_base()

# Database Models
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

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    performance_history = Column(JSON)
    recommendations = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Analytics(Base):
    __tablename__ = "analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    daily_submissions = Column(JSON)
    topic_performance = Column(JSON)
    trends = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic Models
class SubjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    grade_level: Optional[str] = None
    curriculum: Optional[str] = None

class SubjectRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    grade_level: Optional[str] = None
    curriculum: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TopicCreate(BaseModel):
    name: str
    description: Optional[str] = None
    weight: float = 1.0

class TopicRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    weight: float
    subject_id: int

    class Config:
        from_attributes = True

class QuestionCreate(BaseModel):
    question_text: str
    options: List[str]
    correct_answer: str
    difficulty: str = "medium"
    explanation: Optional[str] = None

class QuestionRead(BaseModel):
    id: int
    question_text: str
    options: List[str]
    correct_answer: str
    difficulty: str
    explanation: Optional[str] = None
    topic_id: int

    class Config:
        from_attributes = True

# Database setup
import os
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./smarttest_arena.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI App
app = FastAPI(title="SmartTest Arena - Enhanced Server", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic endpoints
@app.get("/")
def read_root():
    return {"message": "SmartTest Arena Enhanced Server is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Enhanced server is working"}

# Subject Management
@app.get("/subjects", response_model=List[SubjectRead])
def get_subjects(db: SessionLocal = Depends(get_db)):
    """Get all subjects"""
    return db.query(Subject).all()

@app.post("/subjects", response_model=SubjectRead)
def create_subject(subject: SubjectCreate, db: SessionLocal = Depends(get_db)):
    """Create a new subject"""
    db_subject = Subject(**subject.dict())
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

@app.get("/subjects/{subject_id}", response_model=SubjectRead)
def get_subject(subject_id: int, db: SessionLocal = Depends(get_db)):
    """Get a specific subject by ID"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject

# Topic Management
@app.get("/topics", response_model=List[TopicRead])
def get_topics(db: SessionLocal = Depends(get_db)):
    """Get all topics"""
    return db.query(Topic).all()

@app.post("/topics", response_model=TopicRead)
def create_topic(topic: TopicCreate, subject_id: int, db: SessionLocal = Depends(get_db)):
    """Create a new topic"""
    db_topic = Topic(**topic.dict(), subject_id=subject_id)
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

@app.get("/subjects/{subject_id}/topics", response_model=List[TopicRead])
def get_subject_topics(subject_id: int, db: SessionLocal = Depends(get_db)):
    """Get all topics for a specific subject"""
    topics = db.query(Topic).filter(Topic.subject_id == subject_id).all()
    return topics

# Question Management
@app.get("/questions", response_model=List[QuestionRead])
def get_questions(db: SessionLocal = Depends(get_db)):
    """Get all questions"""
    return db.query(Question).all()

@app.post("/questions", response_model=QuestionRead)
def create_question(question: QuestionCreate, topic_id: int, db: SessionLocal = Depends(get_db)):
    """Create a new question"""
    db_question = Question(**question.dict(), topic_id=topic_id)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@app.get("/topics/{topic_id}/questions", response_model=List[QuestionRead])
def get_topic_questions(topic_id: int, db: SessionLocal = Depends(get_db)):
    """Get all questions for a specific topic"""
    questions = db.query(Question).filter(Question.topic_id == topic_id).all()
    return questions

# Analytics
@app.get("/analytics/user/{user_id}")
def get_user_analytics(user_id: int, db: SessionLocal = Depends(get_db)):
    """Get analytics for a specific user"""
    analytics = db.query(Analytics).filter(Analytics.user_id == user_id).first()
    if not analytics:
        return {"message": "No analytics found for user"}
    return analytics

@app.post("/analytics/update")
def update_analytics(user_id: int, subject_id: int, data: Dict[str, Any], db: SessionLocal = Depends(get_db)):
    """Update analytics for a user"""
    analytics = db.query(Analytics).filter(
        Analytics.user_id == user_id,
        Analytics.subject_id == subject_id
    ).first()
    
    if not analytics:
        analytics = Analytics(
            user_id=user_id,
            subject_id=subject_id,
            daily_submissions=data.get("daily_submissions", {}),
            topic_performance=data.get("topic_performance", {}),
            trends=data.get("trends", {})
        )
        db.add(analytics)
    else:
        analytics.daily_submissions = data.get("daily_submissions", analytics.daily_submissions)
        analytics.topic_performance = data.get("topic_performance", analytics.topic_performance)
        analytics.trends = data.get("trends", analytics.trends)
    
    db.commit()
    return {"message": "Analytics updated successfully"}

# Student Profiles
@app.get("/student-profiles/user/{user_id}")
def get_student_profiles(user_id: int, db: SessionLocal = Depends(get_db)):
    """Get all student profiles for a user"""
    profiles = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).all()
    return profiles

@app.post("/student-profiles/update")
def update_student_profile(user_id: int, subject_id: int, performance_data: Dict[str, Any], db: SessionLocal = Depends(get_db)):
    """Update student profile"""
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == user_id,
        StudentProfile.subject_id == subject_id
    ).first()
    
    if not profile:
        profile = StudentProfile(
            user_id=user_id,
            subject_id=subject_id,
            performance_history=performance_data.get("performance_history", []),
            recommendations=performance_data.get("recommendations", [])
        )
        db.add(profile)
    else:
        profile.performance_history = performance_data.get("performance_history", profile.performance_history)
        profile.recommendations = performance_data.get("recommendations", profile.recommendations)
        profile.updated_at = datetime.utcnow()
    
    db.commit()
    return {"message": "Student profile updated successfully"}

# Quiz Submission
@app.post("/quiz/submit")
def submit_quiz(submission_data: Dict[str, Any], db: SessionLocal = Depends(get_db)):
    """Submit quiz results and update analytics"""
    user_id = submission_data.get("user_id")
    subject_id = submission_data.get("subject_id")
    score = submission_data.get("score", 0)
    topic = submission_data.get("topic", "")
    
    # Update analytics
    analytics_data = {
        "daily_submissions": {datetime.now().strftime("%Y-%m-%d"): 1},
        "topic_performance": {topic: score},
        "trends": {"recent_scores": [score]}
    }
    
    # Update student profile
    performance_data = {
        "performance_history": [{
            "date": datetime.now().isoformat(),
            "score": score,
            "topic": topic
        }],
        "recommendations": [
            "Focus on improving weak areas",
            "Practice more questions",
            "Review fundamental concepts"
        ]
    }
    
    # Update both analytics and profile
    update_analytics(user_id, subject_id, analytics_data, db)
    update_student_profile(user_id, subject_id, performance_data, db)
    
    return {
        "message": "Quiz submitted successfully",
        "score": score,
        "recommendations": performance_data["recommendations"]
    }

# Initialize with CAT data
@app.post("/initialize-cat")
def initialize_cat_data(db: SessionLocal = Depends(get_db)):
    """Initialize the database with CAT subject and sample data"""
    try:
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
        
        # Create topics
        topics_data = [
            {"name": "Systems Technologies", "description": "Computer systems and information processing cycle", "weight": 1.0},
            {"name": "Hardware & Software", "description": "Computer hardware components and software types", "weight": 1.0},
            {"name": "Social Implications", "description": "Social and ethical implications of ICT", "weight": 1.0},
            {"name": "Word Processing", "description": "Microsoft Word and document processing", "weight": 1.0},
            {"name": "Spreadsheets", "description": "Microsoft Excel and spreadsheet applications", "weight": 1.0},
            {"name": "Database", "description": "Microsoft Access and database management", "weight": 1.0}
        ]
        
        for topic_data in topics_data:
            topic = Topic(**topic_data, subject_id=cat_subject.id)
            db.add(topic)
        
        db.commit()
        
        return {"message": "CAT data initialized successfully", "subject_id": cat_subject.id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error initializing data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    print(f"🚀 Starting SmartTest Arena Enhanced Server on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port) 