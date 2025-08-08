#!/usr/bin/env python3
"""
Enhanced SmartTest Arena Server with CAT Quiz Integration
Deployed to Railway - Updated for production
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float, ForeignKey, JSON, Boolean, func
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, EmailStr
import json
import os
import bcrypt
from jose import JWTError, jwt
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Create Base
Base = declarative_base()

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Rate Limiter
limiter = Limiter(key_func=get_remote_address)

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_tutor = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    performance_history = Column(JSON)
    recommendations = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Analytics(Base):
    __tablename__ = "analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    daily_submissions = Column(JSON)
    topic_performance = Column(JSON)
    trends = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    score = Column(Float, nullable=False)
    total_questions = Column(Integer, nullable=False)
    time_taken = Column(Integer)  # in seconds
    answers = Column(JSON)  # store user answers
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    is_tutor: bool = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: int
    name: str
    email: str
    is_tutor: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

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

class QuizSubmission(BaseModel):
    user_id: int
    subject_id: int
    topic_id: int
    score: float
    total_questions: int
    time_taken: Optional[int] = None
    answers: Dict[str, Any]

# Database setup
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

# Mount static files
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security
security = HTTPBearer()

# Utility functions
def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: SessionLocal = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

# Basic endpoints
@app.get("/")
def read_root():
    try:
        return FileResponse("frontend/index.html")
    except:
        return {"message": "SmartTest Arena Enhanced Server is running!", "status": "healthy"}

@app.get("/app")
def serve_app():
    try:
        return FileResponse("frontend/index.html")
    except:
        return {"message": "SmartTest Arena Enhanced Server is running!", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Enhanced server is working"}

@app.get("/frontend")
def serve_frontend():
    try:
        return FileResponse("frontend/index.html")
    except:
        return {"error": "Frontend not found"}

@app.get("/static/{path:path}")
def serve_static(path: str):
    try:
        return FileResponse(f"frontend/{path}")
    except:
        return {"error": f"File {path} not found"}

@app.get("/test")
def serve_test():
    """Serve the test page"""
    return FileResponse("frontend/test.html")

# Authentication endpoints
@app.post("/auth/signup", response_model=Token)
def signup(user: UserCreate, db: SessionLocal = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        is_tutor=user.is_tutor
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
def login(user_credentials: UserLogin, db: SessionLocal = Depends(get_db)):
    """Login user"""
    user = db.query(User).filter(User.email == user_credentials.email).first()
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserRead)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

# Subject Management
@app.get("/subjects", response_model=List[SubjectRead])
def get_subjects(db: SessionLocal = Depends(get_db)):
    """Get all subjects"""
    return db.query(Subject).all()

@app.post("/subjects", response_model=SubjectRead)
def create_subject(subject: SubjectCreate, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new subject (tutors only)"""
    if not current_user.is_tutor:
        raise HTTPException(status_code=403, detail="Only tutors can create subjects")
    
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

@app.put("/subjects/{subject_id}", response_model=SubjectRead)
def update_subject(subject_id: int, subject: SubjectCreate, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update a subject (tutors only)"""
    if not current_user.is_tutor:
        raise HTTPException(status_code=403, detail="Only tutors can update subjects")
    
    db_subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    for key, value in subject.dict().items():
        setattr(db_subject, key, value)
    
    db.commit()
    db.refresh(db_subject)
    return db_subject

@app.delete("/subjects/{subject_id}")
def delete_subject(subject_id: int, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a subject (tutors only)"""
    if not current_user.is_tutor:
        raise HTTPException(status_code=403, detail="Only tutors can delete subjects")
    
    db_subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    db.delete(db_subject)
    db.commit()
    return {"message": "Subject deleted successfully"}

# Topic Management
@app.get("/topics", response_model=List[TopicRead])
def get_topics(db: SessionLocal = Depends(get_db)):
    """Get all topics"""
    return db.query(Topic).all()

@app.post("/topics", response_model=TopicRead)
def create_topic(topic: TopicCreate, subject_id: int, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new topic (tutors only)"""
    if not current_user.is_tutor:
        raise HTTPException(status_code=403, detail="Only tutors can create topics")
    
    # Verify subject exists
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
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

@app.put("/topics/{topic_id}", response_model=TopicRead)
def update_topic(topic_id: int, topic: TopicCreate, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update a topic (tutors only)"""
    if not current_user.is_tutor:
        raise HTTPException(status_code=403, detail="Only tutors can update topics")
    
    db_topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    for key, value in topic.dict().items():
        setattr(db_topic, key, value)
    
    db.commit()
    db.refresh(db_topic)
    return db_topic

@app.delete("/topics/{topic_id}")
def delete_topic(topic_id: int, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a topic (tutors only)"""
    if not current_user.is_tutor:
        raise HTTPException(status_code=403, detail="Only tutors can delete topics")
    
    db_topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    db.delete(db_topic)
    db.commit()
    return {"message": "Topic deleted successfully"}

# Question Management
@app.get("/questions", response_model=List[QuestionRead])
def get_questions(db: SessionLocal = Depends(get_db)):
    """Get all questions"""
    return db.query(Question).all()

@app.post("/questions", response_model=QuestionRead)
def create_question(question: QuestionCreate, topic_id: int, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new question (tutors only)"""
    if not current_user.is_tutor:
        raise HTTPException(status_code=403, detail="Only tutors can create questions")
    
    # Verify topic exists
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
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

@app.put("/questions/{question_id}", response_model=QuestionRead)
def update_question(question_id: int, question: QuestionCreate, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update a question (tutors only)"""
    if not current_user.is_tutor:
        raise HTTPException(status_code=403, detail="Only tutors can update questions")
    
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    for key, value in question.dict().items():
        setattr(db_question, key, value)
    
    db.commit()
    db.refresh(db_question)
    return db_question

@app.delete("/questions/{question_id}")
def delete_question(question_id: int, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a question (tutors only)"""
    if not current_user.is_tutor:
        raise HTTPException(status_code=403, detail="Only tutors can delete questions")
    
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    db.delete(db_question)
    db.commit()
    return {"message": "Question deleted successfully"}

# Quiz Attempts
@app.post("/quiz/attempts", response_model=Dict[str, Any])
def create_quiz_attempt(attempt: QuizSubmission, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Submit a quiz attempt"""
    # Verify subject and topic exist
    subject = db.query(Subject).filter(Subject.id == attempt.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    topic = db.query(Topic).filter(Topic.id == attempt.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Create quiz attempt
    db_attempt = QuizAttempt(
        user_id=current_user.id,
        subject_id=attempt.subject_id,
        topic_id=attempt.topic_id,
        score=attempt.score,
        total_questions=attempt.total_questions,
        time_taken=attempt.time_taken,
        answers=attempt.answers
    )
    db.add(db_attempt)
    db.commit()
    db.refresh(db_attempt)
    
    # Update analytics
    update_analytics(current_user.id, attempt.subject_id, {
        "daily_submissions": {datetime.now().strftime("%Y-%m-%d"): 1},
        "topic_performance": {topic.name: attempt.score},
        "trends": {"recent_scores": [attempt.score]}
    }, db)
    
    # Update student profile
    update_student_profile(current_user.id, attempt.subject_id, {
        "performance_history": [{
            "date": datetime.now().isoformat(),
            "score": attempt.score,
            "topic": topic.name,
            "total_questions": attempt.total_questions
        }],
        "recommendations": generate_recommendations(attempt.score, attempt.total_questions)
    }, db)
    
    return {
        "message": "Quiz submitted successfully",
        "attempt_id": db_attempt.id,
        "score": attempt.score,
        "percentage": (attempt.score / attempt.total_questions) * 100
    }

@app.get("/quiz/attempts/user/{user_id}")
def get_user_attempts(user_id: int, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all quiz attempts for a user"""
    if current_user.id != user_id and not current_user.is_tutor:
        raise HTTPException(status_code=403, detail="Can only view your own attempts")
    
    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).all()
    return attempts

def generate_recommendations(score: float, total_questions: int) -> List[str]:
    """Generate personalized recommendations based on performance"""
    percentage = (score / total_questions) * 100
    
    if percentage >= 90:
        return ["Excellent work! Keep up the great performance.", "Consider helping other students."]
    elif percentage >= 80:
        return ["Good job! Focus on the areas where you made mistakes.", "Practice more to reach excellence."]
    elif percentage >= 70:
        return ["You're doing well. Review the concepts you struggled with.", "More practice will improve your score."]
    elif percentage >= 60:
        return ["You need more practice. Focus on fundamental concepts.", "Consider seeking help from a tutor."]
    else:
        return ["You need significant improvement. Review the basics thoroughly.", "Consider taking remedial lessons."]

# Analytics
@app.get("/analytics/user/{user_id}")
def get_user_analytics(user_id: int, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get analytics for a specific user"""
    if current_user.id != user_id and not current_user.is_tutor:
        raise HTTPException(status_code=403, detail="Can only view your own analytics")
    
    analytics = db.query(Analytics).filter(Analytics.user_id == user_id).all()
    if not analytics:
        return {"message": "No analytics found for user"}
    return analytics

@app.get("/analytics/dashboard/{user_id}")
def get_dashboard_analytics(user_id: int, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get real-time dashboard analytics for a user"""
    if current_user.id != user_id and not current_user.is_tutor:
        raise HTTPException(status_code=403, detail="Can only view your own analytics")
    
    # Get recent quiz attempts
    recent_attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == user_id
    ).order_by(QuizAttempt.created_at.desc()).limit(10).all()
    
    # Calculate real-time stats
    total_attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).count()
    total_subjects = db.query(Subject).count()
    
    # Calculate average score
    avg_score = 0
    if total_attempts > 0:
        total_score = db.query(func.sum(QuizAttempt.score)).filter(QuizAttempt.user_id == user_id).scalar() or 0
        avg_score = (total_score / total_attempts) * 100
    
    # Get today's activity
    today = datetime.utcnow().date()
    today_attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == user_id,
        func.date(QuizAttempt.created_at) == today
    ).count()
    
    # Get weekly progress
    week_ago = datetime.utcnow() - timedelta(days=7)
    weekly_attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == user_id,
        QuizAttempt.created_at >= week_ago
    ).all()
    
    weekly_scores = [attempt.score for attempt in weekly_attempts]
    weekly_avg = sum(weekly_scores) / len(weekly_scores) * 100 if weekly_scores else 0
    
    # Get subject performance
    subject_performance = db.query(
        Subject.name,
        func.avg(QuizAttempt.score).label('avg_score'),
        func.count(QuizAttempt.id).label('attempts')
    ).join(QuizAttempt, Subject.id == QuizAttempt.subject_id).filter(
        QuizAttempt.user_id == user_id
    ).group_by(Subject.id, Subject.name).all()
    
    # Format subject performance
    subjects_data = []
    for subject in subject_performance:
        subjects_data.append({
            "subject": subject.name,
            "average_score": round(subject.avg_score * 100, 1),
            "attempts": subject.attempts
        })
    
    # Get recent activity timeline
    recent_activity = []
    for attempt in recent_attempts[:5]:
        subject = db.query(Subject).filter(Subject.id == attempt.subject_id).first()
        recent_activity.append({
            "type": "quiz_attempt",
            "subject": subject.name if subject else "Unknown",
            "score": f"{attempt.score * 100:.1f}%",
            "time": attempt.created_at.strftime("%H:%M"),
            "date": attempt.created_at.strftime("%b %d")
        })
    
    return {
        "real_time_stats": {
            "total_attempts": total_attempts,
            "total_subjects": total_subjects,
            "average_score": round(avg_score, 1),
            "today_attempts": today_attempts,
            "weekly_average": round(weekly_avg, 1)
        },
        "subject_performance": subjects_data,
        "recent_activity": recent_activity,
        "weekly_progress": {
            "attempts_count": len(weekly_attempts),
            "average_score": round(weekly_avg, 1),
            "improvement": "positive" if weekly_avg > avg_score else "neutral"
        }
    }

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
def get_student_profiles(user_id: int, db: SessionLocal = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all student profiles for a user"""
    if current_user.id != user_id and not current_user.is_tutor:
        raise HTTPException(status_code=403, detail="Can only view your own profiles")
    
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

# File Upload
@app.post("/upload/exam")
async def upload_exam_file(
    file: UploadFile = File(...),
    subject_id: int = Form(...),
    topic_id: int = Form(...),
    db: SessionLocal = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload an exam file (tutors only)"""
    if not current_user.is_tutor:
        raise HTTPException(status_code=403, detail="Only tutors can upload files")
    
    # Validate file type
    allowed_types = [".pdf", ".docx", ".txt", ".html"]
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in allowed_types:
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    # Validate file size (5MB limit)
    if file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    
    # Save file
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, f"{current_user.id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    return {
        "message": "File uploaded successfully",
        "filename": file.filename,
        "file_path": file_path,
        "subject_id": subject_id,
        "topic_id": topic_id
    }

# Leaderboard
@app.get("/leaderboard")
def get_leaderboard(db: SessionLocal = Depends(get_db), limit: int = 10):
    """Get leaderboard of top performers"""
    # Simplified leaderboard - return empty for now
    # TODO: Implement proper leaderboard with SQL aggregation
    return []

# Quiz Submission (Legacy endpoint for compatibility)
@app.post("/quiz/submit")
def submit_quiz(submission_data: Dict[str, Any], db: SessionLocal = Depends(get_db)):
    """Submit quiz results and update analytics (legacy endpoint)"""
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
        "recommendations": generate_recommendations(score, 10)  # Assume 10 questions
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
    print(f"🚀 Starting SmartTest Arena Enhanced Server on port {port}... - Railway Production Ready!")
    uvicorn.run(app, host="0.0.0.0", port=port) 