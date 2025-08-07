from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models import StudentProfile, User, Subject
from schemas.student_profile import StudentProfileCreate, StudentProfileRead, StudentProfileUpdate
from core.auth import get_current_user
from datetime import datetime

router = APIRouter()

@router.get("/{user_id}", response_model=List[StudentProfileRead])
def get_student_profiles(user_id: int, db: Session = Depends(get_db)):
    """Get all student profiles for a user"""
    profiles = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).all()
    return profiles

@router.get("/{user_id}/subject/{subject_id}", response_model=StudentProfileRead)
def get_student_profile(user_id: int, subject_id: int, db: Session = Depends(get_db)):
    """Get a specific student profile for a user and subject"""
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == user_id,
        StudentProfile.subject_id == subject_id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return profile

@router.post("/", response_model=StudentProfileRead)
def create_student_profile(profile: StudentProfileCreate, db: Session = Depends(get_db)):
    """Create a new student profile"""
    # Verify user exists
    user = db.query(User).filter(User.id == profile.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify subject exists
    subject = db.query(Subject).filter(Subject.id == profile.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Check if profile already exists
    existing_profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == profile.user_id,
        StudentProfile.subject_id == profile.subject_id
    ).first()
    
    if existing_profile:
        raise HTTPException(status_code=400, detail="Student profile already exists")
    
    db_profile = StudentProfile(**profile.dict())
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.put("/{profile_id}", response_model=StudentProfileRead)
def update_student_profile(profile_id: int, profile: StudentProfileUpdate, db: Session = Depends(get_db)):
    """Update a student profile"""
    db_profile = db.query(StudentProfile).filter(StudentProfile.id == profile_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    for key, value in profile.dict(exclude_unset=True).items():
        setattr(db_profile, key, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.post("/update-performance")
def update_student_performance(performance_data: dict, db: Session = Depends(get_db)):
    """Update student performance based on new attempt"""
    user_id = performance_data.get("user_id")
    subject_id = performance_data.get("subject_id")
    score = performance_data.get("score", 0)
    topic = performance_data.get("topic", "")
    
    # Find or create student profile
    profile = db.query(StudentProfile).filter(
        StudentProfile.user_id == user_id,
        StudentProfile.subject_id == subject_id
    ).first()
    
    if not profile:
        # Create new profile
        profile = StudentProfile(
            user_id=user_id,
            subject_id=subject_id,
            performance_history=[],
            recommendations=[]
        )
        db.add(profile)
    
    # Update performance history
    if not profile.performance_history:
        profile.performance_history = []
    
    performance_record = {
        "date": datetime.utcnow().isoformat(),
        "score": score,
        "topic": topic
    }
    
    profile.performance_history.append(performance_record)
    
    # Generate recommendations based on performance
    recommendations = []
    if score < 70:
        recommendations.append({
            "type": "improvement",
            "topic": topic,
            "message": f"Focus on improving your {topic} skills. Consider reviewing the fundamentals."
        })
    elif score > 90:
        recommendations.append({
            "type": "advanced",
            "topic": topic,
            "message": f"Excellent performance in {topic}! Try more challenging questions."
        })
    
    profile.recommendations = recommendations
    db.commit()
    
    return {"message": "Student performance updated successfully"} 