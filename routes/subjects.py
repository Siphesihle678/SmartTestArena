from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models import Subject, Topic
from schemas.subject import SubjectCreate, SubjectRead, TopicRead
from core.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[SubjectRead])
def get_subjects(db: Session = Depends(get_db)):
    """Get all subjects"""
    return db.query(Subject).all()

@router.post("/", response_model=SubjectRead)
def create_subject(subject: SubjectCreate, db: Session = Depends(get_db)):
    """Create a new subject"""
    db_subject = Subject(**subject.dict())
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

@router.get("/{subject_id}", response_model=SubjectRead)
def get_subject(subject_id: int, db: Session = Depends(get_db)):
    """Get a specific subject by ID"""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject

@router.get("/{subject_id}/topics", response_model=List[TopicRead])
def get_subject_topics(subject_id: int, db: Session = Depends(get_db)):
    """Get all topics for a specific subject"""
    topics = db.query(Topic).filter(Topic.subject_id == subject_id).all()
    return topics 